
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // close menu on route change
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/buy', label: 'Buy' },
    { path: '/rent', label: 'Rent' },
    { path: '/projects', label: 'Projects' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO ONLY (no text) */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Chaitra Real Estate"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-gray-700 hover:text-[#C9A227] transition-colors duration-200 font-medium ${
                  isActive(link.path) ? 'text-[#C9A227]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/list-property"
              className="bg-[#C9A227] text-white px-6 py-2.5 rounded-lg hover:bg-[#B08A1F] transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              List Property
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="pt-3 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#C9A227] transition-colors duration-200 font-medium ${
                    isActive(link.path) ? 'text-[#C9A227] bg-[#C9A227]/5' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/list-property"
                className="mt-3 bg-[#C9A227] text-white px-6 py-3 rounded-lg hover:bg-[#B08A1F] transition-all duration-200 font-medium text-center"
              >
                List Property
              </Link>
              <Link
                to="/admin"
                className="mt-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-center"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
