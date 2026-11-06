// Datos estructurados para buscadores. Se escapa "<" para que el contenido no pueda cerrar el script.
export default function JsonLd({ data }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}
