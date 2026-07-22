/*
 File: src/components/layout/Footer.tsx
 Purpose: Reusable React UI component.
 Main exports: Footer
 */

import { Instagram, Heart, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'


// Footer: Helper or component used in this file.
export function Footer() {
  return (
    <footer id="about" className="bg-secondary/10 mt-10 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center md:px-6">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
          HomeBakers
        </Link>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <Link to="/products" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Catalog
          </Link>
          <Link to="/auth/register" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Become a Baker
          </Link>
          <a href="mailto:support@homebakers.lk" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Contact Us
          </a>
        </nav>

        <div className="mt-8 flex items-center justify-center gap-4">
          {[
            { icon: Instagram, label: 'Instagram' },
            { icon: Heart, label: 'Facebook' },
            { icon: Mail, label: 'Email' },
          ].map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="bg-background shadow-soft flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>

        <p className="text-muted-foreground mt-10 text-sm">
          &copy; {new Date().getFullYear()} HomeBakers Marketplace. Handcrafted with care.
        </p>
      </div>
    </footer>
  )
}