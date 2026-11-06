'use client';

export default function CategoryNav({ categories, selected, onSelect }) {
    return (
        <nav aria-label="Categorías">
            <h2 className="mb-2 hidden px-3 font-sans text-sm font-semibold tracking-normal text-muted lg:block">
                Categorías
            </h2>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-0">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className="cat-link"
                        aria-pressed={selected === cat}
                        onClick={() => onSelect(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </nav>
    );
}
