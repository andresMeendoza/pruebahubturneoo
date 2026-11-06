'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { supabase } from './supabase';

// Sin sesión, el progreso vive en este navegador. Con sesión también se guarda en la
// cuenta (tabla hub_lesson_progress) y lo visto antes de entrar se suma a ella.
const STORAGE_KEY = 'turneoo:lecciones-vistas';
const CHANGE_EVENT = 'turneoo:progreso';

const read = () => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) || '[]';
    } catch {
        return '[]';
    }
};

const write = (slugs) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
        window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
        // Sin almacenamiento disponible, la academia funciona igual pero sin progreso local.
    }
};

const readSet = () => {
    try {
        return new Set(JSON.parse(read()));
    } catch {
        return new Set();
    }
};

const saveToAccount = async (userId, slugs) => {
    if (slugs.length === 0) return;
    const rows = slugs.map((lesson_slug) => ({ user_id: userId, lesson_slug }));
    const { error } = await supabase
        .from('hub_lesson_progress')
        .upsert(rows, { onConflict: 'user_id,lesson_slug', ignoreDuplicates: true });
    if (error) console.warn('No se pudo guardar el progreso en la cuenta:', error.message);
};

const syncWithAccount = async (userId) => {
    const { data, error } = await supabase.from('hub_lesson_progress').select('lesson_slug');
    if (error) return; // Si la tabla aún no existe, se sigue usando el progreso local.

    const remote = new Set(data.map((row) => row.lesson_slug));
    const local = readSet();
    await saveToAccount(userId, [...local].filter((slug) => !remote.has(slug)));
    write(new Set([...local, ...remote]));
};

let syncStarted = false;
let currentUserId = null;

const startSync = () => {
    if (syncStarted) return;
    syncStarted = true;

    supabase.auth.onAuthStateChange((event, session) => {
        const userId = session?.user?.id || null;
        const changedUser = userId !== currentUserId;
        currentUserId = userId;

        if (event === 'SIGNED_OUT') {
            // En un navegador compartido, el progreso no pasa a la siguiente cuenta.
            write(new Set());
        } else if (userId && changedUser) {
            // Fuera del callback: Supabase no admite llamadas a la API dentro de él.
            setTimeout(() => syncWithAccount(userId), 0);
        }
    });
};

const subscribe = (callback) => {
    window.addEventListener('storage', callback);
    window.addEventListener(CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(CHANGE_EVENT, callback);
    };
};

export function markLessonSeen(slug) {
    const seen = readSet();
    if (!seen.has(slug)) {
        seen.add(slug);
        write(seen);
    }
    if (currentUserId) saveToAccount(currentUserId, [slug]);
}

export function useSeenLessons() {
    const raw = useSyncExternalStore(subscribe, read, () => '[]');

    useEffect(startSync, []);

    return useMemo(() => {
        try {
            return new Set(JSON.parse(raw));
        } catch {
            return new Set();
        }
    }, [raw]);
}
