'use client';

import { useState } from 'react';
import AcademyHome from './AcademyHome';

export default function HomeClient({ modules, accentColor }) {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <AcademyHome
            modules={modules}
            accentColor={accentColor}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    );
}
