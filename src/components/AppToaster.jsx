'use client';

import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                style: {
                    background: 'var(--color-ink)',
                    color: '#fff',
                    borderRadius: '0.625rem',
                    fontSize: '0.9375rem',
                },
            }}
        />
    );
}
