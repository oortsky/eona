import { Version } from "@/components/version";
import Link from "next/link";
import {
  Github,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Heart
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-logo">EONA</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Tomorrow Will Be Better.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/axara-dev"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://instragram.com/axara.dev"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com/weareaxara"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">X/Twitter</span>
              </Link>
              <Link
                href="mailto:axara.dev@proton.me"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/intro"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Introduction
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <span>
              © {currentYear} <span className="font-logo">EONA</span>. All
              rights reserved.
            </span>
            <Version className="font-mono" />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by
            <Link
              href="https://github.com/axara-dev"
              className="text-muted-foreground font-semibold hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Axara Dev.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
