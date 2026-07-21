import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#C9A227] mb-4">404</h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 bg-[#C9A227] text-white px-8 py-4 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold"
          >
            <Home size={20} />
            <span>Go to Homepage</span>
          </Link>
          <Link
            to="/buy"
            className="inline-flex items-center justify-center space-x-2 bg-[#1E3A8A] text-white px-8 py-4 rounded-lg hover:bg-[#152c6b] transition-colors font-semibold"
          >
            <Search size={20} />
            <span>Browse Properties</span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <Link
            to="/buy"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-gray-800 mb-2">Buy Properties</h3>
            <p className="text-gray-600 text-sm">Explore properties for sale</p>
          </Link>
          <Link
            to="/rent"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-gray-800 mb-2">Rent Properties</h3>
            <p className="text-gray-600 text-sm">Find rental properties</p>
          </Link>
          <Link
            to="/contact"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-gray-800 mb-2">Contact Us</h3>
            <p className="text-gray-600 text-sm">Get in touch with our team</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
