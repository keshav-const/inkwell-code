import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative border-t border-border/50 backdrop-blur-lg bg-surface-primary/30"
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary transition-all duration-200 hover:scale-110 border border-border/30"
                aria-label={label}
              >
                <Icon size={18} className="text-foreground/70 hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} CodeCollabs — All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
