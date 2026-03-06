"use client";

import type { ReactNode } from "react";

type ExternalLinkConfirmProps = {
  href: string;
  className?: string;
  children: ReactNode;
  message?: string;
};

export function ExternalLinkConfirm({ href, className, children, message }: ExternalLinkConfirmProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        const ok = window.confirm(
          message || "You are now leaving our portal. Do you wish to continue?"
        );
        if (ok) {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
    >
      {children}
    </a>
  );
}
