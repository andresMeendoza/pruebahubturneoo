'use client';

import { Search, X } from 'react-feather';

export default function SearchField({ label, placeholder, value, onChange }) {
    return (
        <div className="relative">
            <label className="sr-only" htmlFor="buscador">{label}</label>
            <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
                id="buscador"
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="field-input !min-h-14 !rounded-xl !pl-12 !pr-12 shadow-lift [&::-webkit-search-cancel-button]:appearance-none"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Borrar búsqueda"
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                >
                    <X size={18} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
