import { Award, Users, Building2, Heart, Target, Eye, CheckCircle } from 'lucide-react';

const About = () => {
  const stats = [
    { number: '15+', label: 'Years of Experience' },
    { number: '5000+', label: 'Happy Clients' },
    { number: '10000+', label: 'Properties Sold' },
    { number: '50+', label: 'Expert Agents' },
  ];

  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Client First',
      description: 'Your satisfaction and success are our top priorities in every transaction.',
    },
    {
      icon: <CheckCircle size={32} />,
      title: 'Integrity',
      description: 'We maintain transparency and honesty in all our dealings.',
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'We strive for excellence in service delivery and customer experience.',
    },
    {
      icon: <Users size={32} />,
      title: 'Teamwork',
      description: 'We work together to achieve the best results for our clients.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Chaitra Real Estate</h1>
          <p className="text-xl text-blue-100">Building trust, creating homes since 2009</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl font-bold text-[#C9A227] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Founded in 2009, Chaitra Real Estate has grown from a small local agency to one of the most trusted names in real estate. Our journey began with a simple vision: to make property transactions simple, transparent, and accessible to everyone.
              </p>
              <p>
                Over the years, we've helped thousands of families find their dream homes, assisted investors in making profitable decisions, and supported businesses in finding the perfect commercial spaces. Our success is built on trust, expertise, and an unwavering commitment to our clients.
              </p>
              <p>
                Today, we operate across multiple cities, manage a diverse portfolio of properties, and continue to innovate in the real estate space. Our team of experienced professionals brings deep market knowledge and personalized service to every transaction.
              </p>
            </div>
          </div>

          <div>
            <img
              src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Our Team"
              className="rounded-xl shadow-lg w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#C9A227] mb-4">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide exceptional real estate services that exceed client expectations, making property transactions seamless, transparent, and rewarding. We aim to be the most trusted partner in every property journey.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#C9A227] mb-4">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To revolutionize the real estate industry through innovation, technology, and exceptional service. We envision a future where property transactions are simple, accessible, and beneficial for all stakeholders.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#C9A227] mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl shadow-lg p-8 md:p-12 text-center text-white">
          <Building2 size={48} className="mx-auto mb-4 text-[#C9A227]" />
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Whether you're buying, selling, or investing, we're here to make your venture dreams come true.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#C9A227] text-white px-8 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
