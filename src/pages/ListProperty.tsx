import { useState } from 'react';
import { Home } from 'lucide-react';
import { api, Enquiry } from '../lib/api';

const ListProperty = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I would like to list my property with Chaitra Real Estate.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const enquiry: Enquiry = formData;

      await api.createEnquiry(enquiry);

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I would like to list my property with Chaitra Real Estate.',
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    'Professional property valuation',
    'High-quality photography',
    'Extensive marketing reach',
    'Dedicated property consultant',
    'Legal documentation support',
    'Quick and hassle-free process',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">List Your Property</h1>
          <p className="text-xl text-blue-100">Get the best value for your property with our expert services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Why List With Us?</h2>

            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <Home size={48} className="text-[#C9A227] mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Process</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">1. Submit Your Details</h4>
                  <p className="text-gray-600">Fill out the form with your contact information</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">2. Property Evaluation</h4>
                  <p className="text-gray-600">Our expert will visit and evaluate your property</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">3. Marketing & Listing</h4>
                  <p className="text-gray-600">We create a professional listing and market your property</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">4. Closing the Deal</h4>
                  <p className="text-gray-600">We handle everything from viewings to final paperwork</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started Today</h2>

              {submitSuccess && (
                <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Thank you! Our team will contact you within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Details</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                    placeholder="Tell us about your property (location, type, size, etc.)"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C9A227] text-white px-6 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Property Details'}
                </button>
              </form>

              <p className="text-sm text-gray-600 mt-4 text-center">
                By submitting this form, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProperty;
