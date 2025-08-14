import type { SVGProps } from "react";

export function KravingsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
      {...props}
    >
      <path
        d="M11 2L3 10V22H9V14H11L18 22L21 19L14.5 12.5L21 6L18 3L13 8L11 6V2Z"
        fill="currentColor"
      />
    </svg>
  );
}
