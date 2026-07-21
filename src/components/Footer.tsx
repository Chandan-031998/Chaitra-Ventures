import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1E3A8A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src="/chaitra.png" alt="Chaitra Real Estate" className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-gray-300 mb-4">
              Your trusted partner in finding the perfect property. We make real estate simple and accessible.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#C9A227] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-[#C9A227] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-[#C9A227] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-[#C9A227] transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C9A227]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-[#C9A227] transition-colors">Home</Link></li>
              <li><Link to="/buy" className="text-gray-300 hover:text-[#C9A227] transition-colors">Buy</Link></li>
              <li><Link to="/rent" className="text-gray-300 hover:text-[#C9A227] transition-colors">Rent</Link></li>
              <li><Link to="/projects" className="text-gray-300 hover:text-[#C9A227] transition-colors">Projects</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-[#C9A227] transition-colors">Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C9A227]">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-[#C9A227] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-[#C9A227] transition-colors">Contact</Link></li>
              <li><Link to="/list-property" className="text-gray-300 hover:text-[#C9A227] transition-colors">List Property</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C9A227]">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-[#C9A227] flex-shrink-0 mt-1" />
                <span className="text-gray-300">123 Real Estate Avenue, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-[#C9A227] flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-[#C9A227] flex-shrink-0" />
                <span className="text-gray-300">info@chaitrarealestate.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Chaitra Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
