import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Share2, Heart, Check } from 'lucide-react';
import { api, Property, Enquiry, resolveImageUrl } from '../lib/api';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await api.getProperty(Number(id));
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const enquiry: Enquiry = {
        ...formData,
        property_id: id,
      };

      await api.createEnquiry(enquiry);

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Property not found</h2>
          <Link to="/buy" className="text-[#C9A227] hover:underline">
            Browse all properties
          </Link>
        </div>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images.map((image) => resolveImageUrl(image as any))
      : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div>
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#C9A227] text-white px-4 py-2 rounded-full text-sm font-medium capitalize">
                    For {property.listing_type}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 size={20} className="text-gray-700" />
                  </button>
                  <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Heart size={20} className="text-gray-700" />
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-[#C9A227]'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:pl-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={20} className="mr-2 text-[#C9A227]" />
                <span className="text-lg">{property.location}</span>
              </div>

              <div className="text-4xl font-bold text-[#1E3A8A] mb-6">
                {formatPrice(property.price)}
                {property.listing_type === 'rent' && <span className="text-xl text-gray-600">/month</span>}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {property.bedrooms > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Bed size={24} className="mx-auto mb-2 text-[#1E3A8A]" />
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="text-lg font-semibold text-gray-800">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Bath size={24} className="mx-auto mb-2 text-[#1E3A8A]" />
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="text-lg font-semibold text-gray-800">{property.bathrooms}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Maximize size={24} className="mx-auto mb-2 text-[#1E3A8A]" />
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-lg font-semibold text-gray-800">{property.area} sqft</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Property Type</h2>
                <p className="text-gray-700 capitalize bg-gray-50 inline-block px-4 py-2 rounded-lg">
                  {property.property_type}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 border-t border-gray-200">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check size={20} className="text-[#C9A227]" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Interested in this property?</h3>

                {submitSuccess && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Thank you! We'll contact you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#C9A227] text-white px-6 py-3 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Send Enquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
