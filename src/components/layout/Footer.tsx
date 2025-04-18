
import React from "react";
import { Package, Twitter, MessageCircle, Share2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-space-dark border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0 animate-fade-in">
            <Package className="w-6 h-6 text-neon-blue mr-2" />
            <span className="text-xl font-bold text-gradient">COSMIC CAPSULES</span>
          </div>
          
          <div className="flex items-center space-x-6 animate-fade-in delay-100">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors transform hover:scale-110 transition-transform duration-200">
              <Twitter size={24} />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors transform hover:scale-110 transition-transform duration-200">
              <MessageCircle size={24} />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors transform hover:scale-110 transition-transform duration-200">
              <Share2 size={24} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0 animate-fade-in delay-200">
            © 2023 Cosmic Capsules. All rights reserved.
          </p>
          
          <div className="flex space-x-6 animate-fade-in delay-300">
            <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
