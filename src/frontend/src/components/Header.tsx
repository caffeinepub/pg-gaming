import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Crosshair, LogIn, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <div className="relative">
            <Crosshair className="w-7 h-7 text-primary group-hover:rotate-45 transition-transform duration-300" />
            <div className="absolute inset-0 animate-pulse-glow">
              <Crosshair className="w-7 h-7 text-primary opacity-40" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-wider">
            <span className="text-primary neon-glow-orange">FREE</span>
            <span className="text-foreground">FIRE</span>
            <span className="text-muted-foreground text-sm ml-2 font-normal tracking-widest hidden sm:inline">
              HUB
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium tracking-wider uppercase transition-colors ${
              location.pathname === "/"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.link"
          >
            Tournaments
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium tracking-wider uppercase transition-colors flex items-center gap-1 ${
                location.pathname === "/admin"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="nav.link"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth + Mobile toggle */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                {identity.getPrincipal().toString().slice(0, 10)}...
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-border hover:border-primary hover:text-primary gap-1"
                data-ocid="auth.button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider gap-1 clip-tactical-sm"
              data-ocid="auth.button"
            >
              <LogIn className="w-4 h-4" />
              {loginStatus === "logging-in" ? "Connecting..." : "Login"}
            </Button>
          )}
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-4">
          <Link
            to="/"
            className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(false)}
            data-ocid="nav.link"
          >
            Tournaments
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.link"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
