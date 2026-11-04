import Link from 'next/link';
import { ArrowLeft } from 'react-feather';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function PublicHubPost({ params }) {
    const { slug } = await params;

    // 1. Buscamos el artículo
    const { data: post, error } = await supabase
        .from('hub_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (error || !post) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#09090b' }}>
                <h2>Ups... Artículo no encontrado</h2>
                <Link href="/" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Volver al inicio</Link>
            </div>
        );
    }

    // 2. Buscamos artículos relacionados
    const { data: relatedPosts } = await supabase
        .from('hub_posts')
        .select('title, slug, type, is_pinned') 
        .eq('category', post.category || 'General')
        .eq('type', post.type)
        .eq('status', 'published')
        .order('created_at', { ascending: true });

    // 3. 🧠 TRAEMOS EL DICCIONARIO DE COLORES
    const { data: colorsData } = await supabase.from('hub_colors').select('*');

    // 4. APLICAMOS LA HERENCIA DE COLOR
    const subCategoryColor = colorsData?.find(c => c.item_type === 'sub' && c.item_name === post.category)?.color_hex;
    const mainCategoryColor = colorsData?.find(c => c.item_type === 'main' && c.item_name === post.type)?.color_hex;
    const colorTheme = subCategoryColor || mainCategoryColor || '#3b82f6';

    const currentIndex = relatedPosts?.findIndex(p => p.slug === slug) || 0;
    const prevPost = currentIndex > 0 ? relatedPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < (relatedPosts?.length - 1) ? relatedPosts[currentIndex + 1] : null;

    const isTutorial = post.type === 'help';
    const currentNumber = currentIndex + 1;
    const tagLabel = isTutorial ? 'Módulo' : 'Categoría';
    const itemLabel = isTutorial ? 'Lección' : 'Artículo';
    const sectionTitle = isTutorial ? 'Lecciones de este módulo' : 'Más noticias de esta categoría';

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 4rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '2rem', fontWeight: '500' }}>
                    <ArrowLeft size={18} /> Volver al Hub
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '48px', height: '48px', background: colorTheme, color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
                        {currentNumber}
                    </div>
                    <div>
                        <div style={{ color: colorTheme, fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {tagLabel} {currentNumber} • {post.category || 'General'}
                        </div>
                        <h1 style={{ color: '#0f172a', fontSize: '2.5rem', margin: '0.2rem 0 0 0', fontWeight: '800', lineHeight: '1.2' }}>{post.title}</h1>
                    </div>
                </div>

                {post.cover_image && (
                    <div style={{ marginBottom: '2.5rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', background: '#0f172a', position: 'relative' }}>
                        {post.is_pinned && (
                            <span style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, background: '#eab308', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>📌 Destacado</span>
                        )}
                        <img src={post.cover_image} alt="Portada" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    </div>
                )}

                <div className="tiptap-content" style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '3rem', background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }} dangerouslySetInnerHTML={{ __html: post.content }} />

                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '3rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '600', textTransform: 'uppercase' }}>{itemLabel} {currentNumber} de {relatedPosts?.length || 1}</p>
                    <h2 style={{ fontSize: '1.3rem', margin: '0 0 1.5rem 0', color: '#0f172a' }}>{post.title}</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {prevPost ? (
                            <Link href={`/blog/${prevPost.slug}`} style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>&larr; Anterior</Link>
                        ) : (
                            <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', borderRadius: '8px', fontWeight: '600', cursor: 'not-allowed' }}>&larr; Anterior</div>
                        )}
                        {nextPost ? (
                            <Link href={`/blog/${nextPost.slug}`} style={{ flex: 1, textAlign: 'center', padding: '12px', background: colorTheme, color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Siguiente {itemLabel.toLowerCase()} &rarr;</Link>
                        ) : (
                            <Link href="/" style={{ flex: 1, textAlign: 'center', padding: '12px', background: colorTheme, color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Finalizar {tagLabel} &rarr;</Link>
                        )}
                    </div>
                </div>

                {relatedPosts && relatedPosts.length > 1 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>{sectionTitle}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {relatedPosts.map((related, index) => {
                                const isCurrent = related.slug === slug;
                                return (
                                    <Link key={related.slug} href={`/blog/${related.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'white', textDecoration: 'none', borderRadius: '12px', border: isCurrent ? `2px solid ${colorTheme}` : '1px solid #e2e8f0', boxShadow: isCurrent ? `0 4px 6px ${colorTheme}15` : '0 2px 4px rgba(0,0,0,0.01)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isCurrent ? colorTheme : '#f1f5f9', color: isCurrent ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>{index + 1}</div>
                                            <span style={{ color: isCurrent ? '#0f172a' : '#334155', fontWeight: isCurrent ? '600' : '400', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {related.is_pinned && <span style={{ marginRight: '6px' }}>📌</span>}
                                                {related.title}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', fontWeight: 'bold', background: isCurrent ? colorTheme : '#f1f5f9', color: isCurrent ? 'white' : '#64748b', flexShrink: 0, marginLeft: '8px' }}>{isCurrent ? 'Viendo' : 'Ver'}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}