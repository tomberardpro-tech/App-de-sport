const paths = {
  home: <path d="M4 11 L12 4 L20 11 V20 H4 Z" strokeLinejoin="round" />,
  dumbbell: <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />,
  apple: <path d="M12 8c-3-2-8-1-8 4 0 5 4 9 6 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 6-4 6-9 0-5-5-6-8-4z M12 8c0-2 1-4 3-5" strokeLinejoin="round" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  up: <path d="M6 15l6-6 6 6" />,
  down: <path d="M6 9l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M5 12l5 5 9-10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  star: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z" strokeLinejoin="round" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M16 16l5 5" /></>,
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20a2 2 0 0 0 4 0" strokeLinejoin="round" />,
  barcode: <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M16 8v8" />,
  bowl: <path d="M4 11h16M5 11c0 5 3 8 7 8s7-3 7-8M9 7c0-2 1-3 3-3" strokeLinejoin="round" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>,
  cup: <path d="M7 4h10l-1.5 16h-7zM7.5 9h9" strokeLinejoin="round" />,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinejoin="round" />,
  pencil: <path d="M4 20l1-5L16 4l4 4L9 19z" strokeLinejoin="round" />,
  trash: <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" strokeLinejoin="round" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.5" /></>,
  trophy: <path d="M7 4h10v5a5 5 0 0 1-10 0z M7 6H4c0 3 1.5 4 3 4 M17 6h3c0 3-1.5 4-3 4 M12 14v4 M8 21h8 M9 18h6" strokeLinejoin="round" />,
  grip: <><circle cx="9" cy="6" r="1.4" fill="currentColor" /><circle cx="15" cy="6" r="1.4" fill="currentColor" /><circle cx="9" cy="12" r="1.4" fill="currentColor" /><circle cx="15" cy="12" r="1.4" fill="currentColor" /><circle cx="9" cy="18" r="1.4" fill="currentColor" /><circle cx="15" cy="18" r="1.4" fill="currentColor" /></>,
  scale: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9a4 4 0 0 1 6 0l-3 3" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" strokeLinejoin="round" />,
  flame: <path d="M12 21c-5 0-7-4-5-8 1 2 2.5 2.5 2.5 2.5C9 11 11 7 14 4c0 4 5 6 4 11-.5 3.5-3 6-6 6z" strokeLinejoin="round" />,
  balance: <path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6h5zM19 7l-2.5 6h5z" strokeLinejoin="round" />,
  undo: <path d="M9 7H4v5M4 12a8 8 0 1 0 3-6.2" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, stroke = 1.7, filled = false, className }: { name: IconName; size?: number; stroke?: number; filled?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
