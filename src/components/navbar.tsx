import { Menu } from "@/components/menu";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto container">
        <div className="relative overflow-hidden rounded-2xl bg-background/10 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] before:animate-liquid-slow before:pointer-events-none">
          <div className="flex justify-between items-center">
            {/* Menu Dropdown */}
            <Menu />
            {/* Email User or Brand Title or give transition between Brand Title and Email User. IF NOT SIGN IN: Just Show Brand Title */}
            <span className="text-3xl font-logo tracking-widest drop-shadow-lg -mb-1.5 -mr-0.5">
              <Link href="/">EONA</Link>
            </span>
            {/* Mode Toggle */}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
