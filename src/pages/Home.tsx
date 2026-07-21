
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home as HomeIcon, Building2, MapPin, TrendingUp, Award, Users, HeadphonesIcon, Star } from 'lucide-react';
import { api, Property, Testimonial } from '../lib/api';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'sale' | 'rent'>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [props, testi] = await Promise.all([
          api.getFeaturedProperties(6),
          api.getTestimonials(3),
        ]);
        setFeaturedProperties(props || []);
        setTestimonials(testi || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${searchType}?search=${encodeURIComponent(searchQuery)}`);
  };

  const categories = [
    { icon: <Building2 size={40} />, title: 'Apartments', count: '150+ Properties', type: 'apartment' },
    { icon: <HomeIcon size={40} />, title: 'Villas', count: '80+ Properties', type: 'villa' },
    { icon: <MapPin size={40} />, title: 'Plots', count: '120+ Properties', type: 'plot' },
    { icon: <TrendingUp size={40} />, title: 'Commercial', count: '60+ Properties', type: 'commercial' },
  ];

  const whyChooseUs = [
    { icon: <Award size={32} />, title: 'Trusted Expertise', description: '15+ years of experience in real estate market' },
    { icon: <Users size={32} />, title: 'Happy Clients', description: '5000+ satisfied customers and counting' },
    { icon: <HeadphonesIcon size={32} />, title: '24/7 Support', description: 'Always here to help you find your dream property' },
    { icon: <Star size={32} />, title: 'Best Deals', description: 'Competitive prices and exclusive offers' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Discover the perfect place to call home
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setSearchType('sale')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  searchType === 'sale'
                    ? 'bg-[#C9A227] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  searchType === 'rent'
                    ? 'bg-[#C9A227] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rent
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Enter location, property type, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-4 rounded-lg border-2 border-gray-200 focus:border-[#C9A227] focus:outline-none text-gray-800 text-base sm:text-lg"
              />
              <button
                type="submit"
                className="bg-[#C9A227] text-white px-6 sm:px-8 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Search size={20} />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/buy?type=${category.type}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-[#1E3A8A] mb-4 group-hover:bg-[#C9A227] group-hover:text-white transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked properties just for you
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]"></div>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-12">No featured properties available at the moment.</p>
          )}

          <div className="text-center mt-12">
            <Link
              to="/buy"
              className="inline-block bg-[#1E3A8A] text-white px-8 py-3 rounded-lg hover:bg-[#152c6b] transition-colors font-semibold"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Chaitra Ventures
            </h2>
            <p className="text-lg text-gray-600">
              Your satisfaction is our priority
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#C9A227] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-lg text-gray-600">
                Real stories from real customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} className="text-[#C9A227] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Get started today and discover amazing properties tailored to your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/buy"
              className="bg-[#C9A227] text-white px-8 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold inline-block"
            >
              Browse Properties
            </Link>
            <Link
              to="/contact"
              className="bg-white text-[#1E3A8A] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
