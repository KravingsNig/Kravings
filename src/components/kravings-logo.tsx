import type { SVGProps } from "react";

export function KravingsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      {...props}
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3" />
      <path d="m8 2 2.3 2.3a3 3 0 0 1 0 4.2l-1.8 1.8a3 3 0 0 1-4.2 0L2 8" />
      <path d="M14 14 21.7 21.7" />
    </svg>
  );
}
