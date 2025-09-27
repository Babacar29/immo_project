import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="https://horizons-cdn.hostinger.com/aeb6ee32-cd60-4177-a292-439842f478ee/e7daf38a2f0da6ffe7fa31e1662bbc09.jpg" alt="Logo Nomad'immo" className="h-10 w-auto rounded-md" />
              <span className="text-xl font-bold">Nomad'immo</span>
            </Link>
            <p className="text-white text-sm">
              L'immobilier sans frontières. Nous vous accompagnons dans l'achat, la vente et la location de biens d'exception, partout dans le monde.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-lg font-semibold">Liens rapides</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-white hover:text-gray-300 transition-colors">Accueil</Link></li>
              <li><Link to="/properties" className="text-white hover:text-gray-300 transition-colors">Propriétés</Link></li>
              <li><Link to="/contact" className="text-white hover:text-gray-300 transition-colors">Contact</Link></li>
              <li><a href="#" className="text-white hover:text-gray-300 transition-colors">À propos</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-lg font-semibold">Services</span>
            <ul className="space-y-2 text-sm">
              <li><span className="text-white">Achat immobilier</span></li>
              <li><span className="text-white">Vente immobilier</span></li>
              <li><span className="text-white">Location internationale</span></li>
              <li><span className="text-white">Gestion locative</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-lg font-semibold">Contact</span>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-white/70" />
                <span className="text-white">+221 71 032 66 71</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-white/70" />
                <span className="text-white">contact@nomadimmo.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-white/70" />
                <span className="text-white">Présence mondiale</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-sm">
            © 2024 Nomad'immo. Tous droits réservés.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://www.facebook.com/profile.php?id=61578363185474" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://x.com/NomadImmo" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors" title="X (Twitter)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/nomad_imo/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@nomad_immo?lang=fr" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors" title="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.169-1.894-1.169-2.894V1h-3.301v8.986c0 .041-.003.082-.009.123v.989c0 1.793-1.539 3.247-3.437 3.247s-3.437-1.454-3.437-3.247 1.539-3.247 3.437-3.247c.384 0 .752.067 1.092.189V4.845c-.341-.041-.693-.062-1.092-.062-3.59 0-6.5 2.596-6.5 5.803s2.91 5.803 6.5 5.803c3.59 0 6.5-2.596 6.5-5.803V8.375c1.419.98 3.156 1.557 5.016 1.557V6.743c-.827 0-1.596-.221-2.251-.614-.549-.331-1.019-.793-1.368-1.346-.349-.553-.549-1.186-.549-1.847V1.444h-.858z"/>
              </svg>
            </a>
            {/* <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;