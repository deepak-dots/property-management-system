import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../utils/axiosInstance';
import PropertyCard from '../components/PropertyCard';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

export default function Home() {
  const [recentProperties, setRecentProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get('/properties?limit=6')
      .then(res => {
        if (Array.isArray(res.data)) {
          setRecentProperties(res.data);
        } else if (Array.isArray(res.data.properties)) {
          setRecentProperties(res.data.properties);
        } else {
          setRecentProperties([]); 
        }
      })
      .catch(err => {
        console.error(err);
        setRecentProperties([]);
      });

    axios.get('/properties?limit=7&featured=true')
      .then(res => {
        if (Array.isArray(res.data)) {
          setFeaturedProperties(res.data);
        } else if (Array.isArray(res.data.properties)) {
          setFeaturedProperties(res.data.properties);
        } else {
          setFeaturedProperties([]);
        }
      })
      .catch(err => {
        console.error(err);
        setFeaturedProperties([]);
      });
  }, []);

  return (
    <div>
      {/* Banner */}
      <div className="hero-banner bg-cover bg-center h-[300px] flex items-center justify-center text-white">
        <h1 className="text-4xl font-bold bg-black bg-opacity-50 p-4 rounded">
          Welcome to Dotsquares eProperty
        </h1>
      </div>

      {/* Featured Properties - Slider */}
      <div className="max-w-6xl mx-auto p-6 mt-12">
        <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
        {featuredProperties.length === 0 && <p>Loading...</p>}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={true}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
          }}
          autoplay={{
            delay: 3000, 
            disableOnInteraction: false,
          }}
        >
          {featuredProperties.map((property) => (
            <SwiperSlide key={property._id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

      {/* Recently Added Properties - Grid */}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Recently Added Properties</h2>
        {recentProperties.length === 0 && <p>Loading...</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </div>

    
    </div>
  );
}
