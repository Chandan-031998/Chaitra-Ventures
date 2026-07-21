import { Home, Building2, FileText, TrendingUp, Calculator, Shield, Key, Users } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Home size={40} />,
      title: 'Property Buying',
      description: 'Find your dream home with our extensive property listings and expert guidance.',
      features: ['Wide range of properties', 'Expert consultation', 'Negotiation support', 'Documentation assistance'],
    },
    {
      icon: <Building2 size={40} />,
      title: 'Property Selling',
      description: 'Sell your property quickly and at the best price with our marketing expertise.',
      features: ['Free property valuation', 'Professional photography', 'Wide marketing reach', 'Legal support'],
    },
    {
      icon: <Key size={40} />,
      title: 'Property Rental',
      description: 'Rent out your property hassle-free or find the perfect rental home.',
      features: ['Tenant verification', 'Rent collection', 'Maintenance support', 'Legal agreements'],
    },
    {
      icon: <FileText size={40} />,
      title: 'Property Management',
      description: 'Comprehensive property management services for landlords and property owners.',
      features: ['Regular inspections', 'Maintenance coordination', 'Tenant relations', 'Financial reporting'],
    },
    {
      icon: <Calculator size={40} />,
      title: 'Home Loans',
      description: 'Get the best home loan deals with competitive interest rates.',
      features: ['Multiple bank options', 'Quick approval', 'Competitive rates', 'Expert advice'],
    },
    {
      icon: <Shield size={40} />,
      title: 'Legal Assistance',
      description: 'Complete legal support for all property-related documentation.',
      features: ['Title verification', 'Agreement drafting', 'Registration support', 'Legal consultation'],
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Investment Advisory',
      description: 'Make informed investment decisions with our market insights.',
      features: ['Market analysis', 'ROI calculation', 'Risk assessment', 'Portfolio planning'],
    },
    {
      icon: <Users size={40} />,
      title: 'Consultancy Services',
      description: 'Expert real estate consultancy for all your property needs.',
      features: ['Property valuation', 'Market research', 'Feasibility studies', 'Strategic planning'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100">Comprehensive realty solutions for all your needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What We Offer</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From buying and selling to property management and investment advisory, we provide end-to-end services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#C9A227] mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="text-[#C9A227] mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Need a Custom Solution?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Every property transaction is unique. Let us know your specific requirements, and we'll create a tailored solution for you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#C9A227] text-white px-8 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold"
          >
            Contact Us Today
          </a>
        </div>
      </div>
    </div>
  );
};

export default Services;
