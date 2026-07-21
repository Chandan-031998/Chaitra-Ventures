
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api, Enquiry } from '../lib/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
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
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: <MapPin size={24} />, title: 'Visit Us', details: ['Chaitra Ventures', 'Mysuru, Karnataka', 'India'] },
    { icon: <Phone size={24} />, title: 'Call Us', details: ['+91 90000 00000'] },
    { icon: <Mail size={24} />, title: 'Email Us', details: ['info@chaitraventures.com'] },
    { icon: <Clock size={24} />, title: 'Working Hours', details: ['Monday - Saturday: 9AM - 7PM', 'Sunday: 10AM - 5PM'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">We're here to help you find your perfect property</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have a question or need assistance? Fill out the form below and our team will get back to you as soon as possible.
            </p>

            {submitSuccess && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Thank you for contacting us! We'll get back to you soon.
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
                  placeholder="Your name"
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
                  placeholder="you@example.com"
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
                  placeholder="+91 90000 00000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C9A227] text-white px-6 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 text-[#C9A227] flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <iframe
                  src="https://www.google.com/maps?q=Mysuru%20Karnataka&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
