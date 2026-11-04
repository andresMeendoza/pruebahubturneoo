'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HubMainLayout({ children }) {
    // Estas son las categorías que ya tienes en tus botones superiores
    const categorias = [
        "Todos",
        "Punto de Venta",
        "Gestión de Agenda",
        "Catálogo",
        "Inventario",
        "Fidelización",
        "Marketing",
        "General"
    ];

    // Estado local para simular la categoría activa (puedes conectarlo a tu estado real luego)
    const [activeCat, setActiveCat] = useState("Todos");

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* 1. BARRA LATERAL DE CATEGORÍAS */}
            <aside style={{ 
                width: '280px', 
                borderRight: '1px solid #e2e8f0', 
                background: '#f8fafc',
                position: 'sticky', 
                top: 0, 
                height: '100vh', 
                overflowY: 'auto',
                padding: '2rem 1.5rem'
            }}>
                <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    📚 Explorar Hub
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        Categorías
                    </div>
                    {categorias.map(cat => {
                        const isActive = activeCat === cat;
                        return (
                            <button 
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                style={{ 
                                    textDecoration: 'none', 
                                    color: isActive ? '#2563eb' : '#334155', 
                                    background: isActive ? '#eff6ff' : 'transparent',
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.9rem', 
                                    fontWeight: isActive ? '600' : '400',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'block',
                                    width: '100%'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* 2. COLUMNA CENTRAL (Aquí va tu buscador y la cuadrícula) */}
            <main style={{ flex: 1, padding: '4rem 2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}