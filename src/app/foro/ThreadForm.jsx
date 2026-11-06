import Link from 'next/link';
import { ArrowLeft } from 'react-feather';
import RichTextEditor from './RichTextEditor';

// Formulario común para crear y editar un tema del foro.
export default function ThreadForm({
    heading,
    backHref,
    backLabel,
    title,
    onTitleChange,
    titlePlaceholder,
    category,
    onCategoryChange,
    categories,
    content,
    onContentChange,
    submitting,
    submitLabel,
    submittingLabel,
    onSubmit,
}) {
    return (
        <>
            <Link href={backHref} className="btn btn-ghost btn-sm -ml-2 mb-5">
                <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
            </Link>

            <div className="card p-5 sm:p-8">
                <h1 className="mb-6 text-3xl font-extrabold text-ink">{heading}</h1>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="thread-title" className="field-label">Título de la discusión</label>
                        <input
                            id="thread-title"
                            type="text"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder={titlePlaceholder}
                            className="field-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="thread-category" className="field-label">Categoría</label>
                        <select
                            id="thread-category"
                            value={category}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="field-input"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="field-label">Contenido</p>
                        <RichTextEditor content={content} onChange={onContentChange} />
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Link href={backHref} className="btn btn-secondary">Cancelar</Link>
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                            {submitting ? submittingLabel : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
