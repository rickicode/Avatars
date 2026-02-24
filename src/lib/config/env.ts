export type BackgroundTheme = {
  id: string;
  name: string;
  css: string;
};

const defaultThemes: BackgroundTheme[] = [
  { id: 'studio-pastel', name: 'Pastel Studio', css: 'radial-gradient(circle at top, #f9fbff 0%, #eef2ff 45%, #f8eaff 100%)' },
  { id: 'sunset-room', name: 'Sunset Room', css: 'linear-gradient(160deg, #ffe2cf 0%, #ffd1eb 46%, #c3d9ff 100%)' },
  { id: 'night-neon', name: 'Neon Night', css: 'radial-gradient(circle at 20% 20%, #5842b8 0%, #2b1c56 38%, #110a24 100%)' },
  { id: 'cloud-cafe', name: 'Cloud Cafe', css: 'linear-gradient(180deg, #fffaf2 0%, #ffe8d8 45%, #dceeff 100%)' },
  { id: 'mint-park', name: 'Mint Park', css: 'radial-gradient(circle at 80% 10%, #e7fff7 0%, #c9f7eb 42%, #cfe4ff 100%)' },
  { id: 'sakura-stage', name: 'Sakura Stage', css: 'linear-gradient(165deg, #ffe8f3 0%, #ffd9ea 40%, #ddd7ff 100%)' }
];

function parseThemes(raw: string | undefined): BackgroundTheme[] {
  if (!raw) return defaultThemes;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultThemes;

    const mapped = parsed
      .map((item, index) => ({
        id: String(item.id ?? `theme-${index + 1}`),
        name: String(item.name ?? `Theme ${index + 1}`),
        css: String(item.css ?? '')
      }))
      .filter((theme) => theme.css.length > 0);

    return mapped.length ? mapped : defaultThemes;
  } catch {
    return defaultThemes;
  }
}

export const appConfig = {
  modelUrl: import.meta.env.VITE_AVATAR_MODEL_URL || '/avatar.vrm',
  themes: parseThemes(import.meta.env.VITE_BACKGROUND_THEMES),
  defaultThemeId: import.meta.env.VITE_DEFAULT_THEME_ID || 'studio-pastel'
};
