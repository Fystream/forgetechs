"use client";

import Logo from "./Logo";
import Magnetic from "@/components/ui/Magnetic";

/* Section labels lifted from the live site's narrative, renamed to read as a
 * studio index rather than a page menu. */
const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;

export default function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-6 py-7 md:px-10 md:py-8">
      <nav className="flex items-center justify-between">
        {/* --- Brand ------------------------------------------------------ */}
        <div data-anim="logo" className="opacity-0">
          <Logo />
        </div>

        {/* --- Index ------------------------------------------------------ */}
        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href} data-anim="nav-link" className="opacity-0">
              <Magnetic radius={90} strength={0.22} labelStrength={1.25}>
                <a
                  href={link.href}
                  className="group relative block py-1 text-[13px] tracking-[-0.01em] text-bone-70 transition-colors duration-500 hover:text-bone"
                >
                  {link.label}
                  {/* Underline wipes in from the left on hover. transform-only,
                      so it never triggers layout. */}
                  <span className="absolute -bottom-px left-0 h-px w-full origin-right scale-x-0 bg-bone transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>

        {/* --- Contact CTA ------------------------------------------------ */}
        <div data-anim="nav-link" className="opacity-0">
          <Magnetic radius={110} strength={0.3}>
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-bone-12 px-5 py-2.5 text-[12px] tracking-[-0.01em] text-bone transition-colors duration-500 hover:border-bone-28"
            >
              {/* Fill sweeps up from below on hover; the label inverts to navy. */}
              <span className="absolute inset-0 -z-10 translate-y-full bg-bone transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative transition-colors duration-[600ms] group-hover:text-midnight">
                Start a project
              </span>
              <span className="relative h-1.5 w-1.5 rounded-full bg-bone-45 transition-colors duration-[600ms] group-hover:bg-midnight" />
            </a>
          </Magnetic>
        </div>
      </nav>
    </header>
  );
}
