import { Crosshair } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="border-t border-border mt-auto py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Crosshair className="w-4 h-4 text-primary" />
          <span className="font-display font-bold tracking-wider text-sm">
            <span className="text-primary">FREE</span>FIRE HUB
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          &copy; {year}. Built with ❤️ using{" "}
          <a
            href={utm}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          BATTLE ROYALE TOURNAMENT PLATFORM
        </p>
      </div>
    </footer>
  );
}
