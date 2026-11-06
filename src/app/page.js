import { buildModules } from '../lib/academy';
import { resolveColor } from '../lib/color';
import { getAcademyData } from '../lib/content';
import HomeClient from '../components/HomeClient';

export const revalidate = 60;

export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
    const { lessons, categories, colors } = await getAcademyData();

    return (
        <HomeClient
            modules={buildModules(categories, lessons, colors)}
            accentColor={resolveColor(colors, null)}
        />
    );
}
