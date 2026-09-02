/** Ícones de interface: traco fino, alinhados a tipografia do painel. */

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
});

export const SearchIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="8.6" cy="8.6" r="5.1" />
    <path d="M12.4 12.4L17 17" />
  </svg>
);

export const RefreshIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M16.4 8.2A6.6 6.6 0 1 0 16 12.4" />
    <path d="M16.8 3.6v4.6h-4.6" />
  </svg>
);

export const DownloadIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M10 3v9.4" />
    <path d="M6.3 9.1 10 12.8l3.7-3.7" />
    <path d="M3.4 15.8h13.2" />
  </svg>
);

export const CopyIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="7" y="7" width="9.6" height="9.6" rx="1.4" />
    <path d="M13.2 4.6a1.4 1.4 0 0 0-1.4-1.2H4.8a1.4 1.4 0 0 0-1.4 1.4v7a1.4 1.4 0 0 0 1.2 1.4" />
  </svg>
);

export const PlusIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M10 4.2v11.6M4.2 10h11.6" />
  </svg>
);

export const EyeIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M1.8 10S4.9 4.9 10 4.9 18.2 10 18.2 10 15.1 15.1 10 15.1 1.8 10 1.8 10Z" />
    <circle cx="10" cy="10" r="2.4" />
  </svg>
);

export const PencilIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M13.4 3.6a1.7 1.7 0 0 1 2.4 2.4L6.9 14.9l-3.3.9.9-3.3 8.9-8.9Z" />
    <path d="M12.2 4.8 14.6 7.2" />
  </svg>
);

export const TrashIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3.4 5.4h13.2" />
    <path d="M8 5.4V4.1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.3" />
    <path d="M5.2 5.4 6 16a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9l.8-10.6" />
    <path d="M8.6 8.4v5.2M11.4 8.4v5.2" />
  </svg>
);

export const CloseIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 5l10 10M15 5 5 15" />
  </svg>
);

export const LogoutIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M8.4 16.6H4.8a1.4 1.4 0 0 1-1.4-1.4V4.8a1.4 1.4 0 0 1 1.4-1.4h3.6" />
    <path d="M12.6 13.4 16.6 10l-4-3.4" />
    <path d="M16.4 10H7.8" />
  </svg>
);

export const SortIcon = ({ direction }: { direction: "asc" | "desc" | null }) => (
  <svg width={9} height={11} viewBox="0 0 9 11" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M4.5 0.8 7.2 4H1.8L4.5 0.8Z"
      fill="currentColor"
      opacity={direction === "asc" ? 1 : 0.25}
    />
    <path
      d="M4.5 10.2 1.8 7h5.4L4.5 10.2Z"
      fill="currentColor"
      opacity={direction === "desc" ? 1 : 0.25}
    />
  </svg>
);
