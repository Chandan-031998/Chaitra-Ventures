
import { useEffect, useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { api, Project, resolveImageUrl } from '../lib/api';

const FALLBACK_PROJECT_IMAGE =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getProjects();
        setProjects(data || []);
      } catch (e) {
        console.error(e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-blue-100">Building dreams, creating landmarks</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-600">No projects available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-64">
                  <img
                    src={resolveImageUrl(project.image as any) || FALLBACK_PROJECT_IMAGE}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#C9A227] text-white">
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h3>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={18} className="mr-2 text-[#C9A227]" />
                    <span>{project.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar size={18} className="mr-2 text-[#C9A227]" />
                    <span>Expected Completion: {project.completion_year}</span>
                  </div>

                  <p className="text-gray-700 mb-4">{project.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold text-gray-800">{project.type}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Units</p>
                      <p className="font-semibold text-gray-800">{project.units}</p>
                    </div>
                  </div>

                  <button className="w-full bg-[#C9A227] text-white px-6 py-3 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
