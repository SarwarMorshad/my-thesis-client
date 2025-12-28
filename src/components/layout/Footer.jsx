// src/components/layout/Footer.jsx

const Footer = () => {
  return (
    <footer className="border-t border-white/10 p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold mb-3">About Project</h3>
            <p className="text-gray-400 text-sm">
              Interactive User Interface for Visualization of Deep Learning Algorithms Analysis and Comparison
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Research Paper
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>TU Chemnitz</li>
              <li>Computer Science Department</li>
              <li>Germany</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm pt-6 border-t border-white/10">
          <p>Master's Thesis Project • TU Chemnitz • 2025</p>
          <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
