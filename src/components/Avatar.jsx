const SIZES = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

const TONES = {
    brand: 'bg-brand text-white',
    ink: 'bg-ink text-white',
    soft: 'bg-line text-ink-soft',
};

export default function Avatar({ name = '', size = 'md', tone = 'brand' }) {
    return (
        <span
            aria-hidden="true"
            className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${TONES[tone]}`}
        >
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
