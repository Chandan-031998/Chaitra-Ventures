
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { api, Property } from '../lib/api';
import { PROPERTY_TYPE_OPTIONS } from '../lib/propertyTypes';
import PropertyCard from '../components/PropertyCard';

const parsePriceRange = (v: string): { min?: number; max?: number } => {
  if (!v || v === 'all') return {};
  const [minStr, maxStr] = v.split('-');
  const min = Number(minStr);
  const max = Number(maxStr);
  return {
    minPrice: Number.isFinite(min) ? min : undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
  };
};

const Buy = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('type') || 'all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, priceRange, bedroomFilter, searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const searchQuery = searchParams.get('search') || undefined;
      const { minPrice, maxPrice } = parsePriceRange(priceRange);

      const data = await api.getProperties({
        listing_type: 'rent',
        type: propertyType,
        minPrice,
        maxPrice,
        bedrooms: bedroomFilter === 'all' ? undefined : parseInt(bedroomFilter, 10),
        search: searchQuery,
      });

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Properties for Rent</h1>
          <p className="text-xl text-blue-100">Find your perfect rental property</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-700">
            <span className="font-semibold">{properties.length}</span> properties found
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-2 bg-[#C9A227] text-white px-4 py-2 rounded-lg"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl p-6 shadow-md md:sticky md:top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Filters</h3>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                >
                  <option value="all">All Types</option>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="0-20000">Under ₹20,000/month</option>
                  <option value="20000-40000">₹20k - ₹40k</option>
                  <option value="40000-60000">₹40k - ₹60k</option>
                  <option value="60000-0">Above ₹60k</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                <select
                  value={bedroomFilter}
                  onChange={(e) => setBedroomFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                >
                  <option value="all">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setPropertyType('all');
                  setPriceRange('all');
                  setBedroomFilter('all');
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]"></div>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buy;
