import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '../lib/api';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const primaryImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <Link to={`/property/${property.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-[#C9A227] text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
              For {property.listing_type}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#C9A227] transition-colors">
              {formatPrice(property.price)}
            </h3>
            <span className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">
              {property.property_type}
            </span>
          </div>

          <h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h4>

          <div className="flex items-center text-gray-600 mb-4">
            <MapPin size={16} className="mr-1 text-[#C9A227]" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {property.bedrooms > 0 && (
              <div className="flex items-center text-gray-600">
                <Bed size={18} className="mr-1.5 text-[#1E3A8A]" />
                <span className="text-sm">{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center text-gray-600">
                <Bath size={18} className="mr-1.5 text-[#1E3A8A]" />
                <span className="text-sm">{property.bathrooms} Bath</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Maximize size={18} className="mr-1.5 text-[#1E3A8A]" />
              <span className="text-sm">{property.area} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
