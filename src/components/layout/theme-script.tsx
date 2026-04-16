/**
 * ThemeScript — prevents flash of wrong theme on page load.
 *
 * This is a SERVER component that renders an inline <script> tag.
 * It runs synchronously before paint, reading the user's stored
 * preference from localStorage and applying the `dark` class
 * to <html> when appropriate.
 */

const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var shouldDark = stored === 'dark' || (!stored && prefersDark) || (stored === 'system' && prefersDark);
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      suppressHydrationWarning
    />
  );
}
