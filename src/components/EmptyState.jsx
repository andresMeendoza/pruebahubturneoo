export default function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
            {Icon && (
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon size={22} aria-hidden="true" />
                </span>
            )}
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            {text && <p className="mt-1 max-w-md text-muted">{text}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
