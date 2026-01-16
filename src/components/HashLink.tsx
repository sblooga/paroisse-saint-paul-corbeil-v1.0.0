import { PropsWithChildren, MouseEvent, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type HashLinkProps = PropsWithChildren<{
  /** Supports: "#section" or "/#section" */
  to: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}>;

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HashLink({ to, className, children, onClick }: HashLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);

      if (!to.includes("#")) return;

      // Always prevent full reload for internal hash navigation
      e.preventDefault();

      const [path, hash] = to.split("#");
      const nextHash = `#${hash ?? ""}`;

      // Same page: just scroll
      if (!path || path === location.pathname) {
        window.history.replaceState(null, "", nextHash);
        scrollToHash(nextHash);
        return;
      }

      // Different page: navigate then scroll
      navigate(`${path}${nextHash}`);
      // Let the DOM render before scrolling
      requestAnimationFrame(() => scrollToHash(nextHash));
    },
    [location.pathname, navigate, onClick, to]
  );

  return (
    <a href={to} className={cn(className)} onClick={handleClick}>
      {children}
    </a>
  );
}
