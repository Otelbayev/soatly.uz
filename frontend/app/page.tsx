import HeroSection from '@/components/HeroSection';
import FeaturedSection from '@/components/FeaturedSection';
import CategorySection from '@/components/CategorySection';
import BrandSection from '@/components/BrandSection';
import HomeSections from '@/components/HomeSections';
import StatsSection from '@/components/StatsSection';
import WhyUsSection from '@/components/WhyUsSection';
import ProcessSection from '@/components/ProcessSection';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredData, categoriesData, brandsData] = await Promise.allSettled([
    api.getProducts({ featured: true, limit: 6 }),
    api.getCategories(),
    api.getBrands(),
  ]);

  const featured   = featuredData.status   === 'fulfilled' ? featuredData.value.products : [];
  const categories = categoriesData.status === 'fulfilled' ? categoriesData.value : [];
  const brands     = brandsData.status     === 'fulfilled' ? brandsData.value : [];

  return (
    <>
      <HeroSection />
      <StatsSection />
      <CategorySection categories={categories} />
      <WhyUsSection />
      <BrandSection brands={brands} />
      <FeaturedSection products={featured} />
      <ProcessSection />
      <HomeSections />
    </>
  );
}
