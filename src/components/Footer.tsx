import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/movies" className="text-neutral-400 hover:text-white text-sm transition-colors">Movies</Link></li>
              <li><Link to="/songs" className="text-neutral-400 hover:text-white text-sm transition-colors">Songs</Link></li>
              <li><Link to="/tv-shows" className="text-neutral-400 hover:text-white text-sm transition-colors">TV Shows</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-sm transition-colors">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-sm transition-colors">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-sm transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-neutral-500 text-sm">lokaFlix. For educational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
