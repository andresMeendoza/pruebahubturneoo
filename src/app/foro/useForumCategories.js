'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const DEFAULT_CATEGORY = 'General';

// Las categorías vienen de hub_categories, las mismas que se administran en el panel.
export function useForumCategories(currentCategory) {
    const [names, setNames] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const { data, error } = await supabase.from('hub_categories').select('name').order('name');
            if (isMounted && !error && data) setNames(data.map((c) => c.name));
        };
        load();
        return () => { isMounted = false; };
    }, []);

    // Un tema conserva su categoría aunque ya no exista en la lista.
    return [...new Set([DEFAULT_CATEGORY, ...names, currentCategory].filter(Boolean))];
}
