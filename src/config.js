export const COLORS = {
  bgDeep: '#060b06', bgPanel: '#0d1a0d', bgCard: '#111e11', bgHover: '#162216',
  textPrimary: '#f0ebe0', textSecondary: '#8a9a7a', textMuted: '#5a6a4a',
  accentGreen: '#b8c8a0', accentGold: '#c9a96e', accentCream: '#efe7d3',
  skyTop: 0x87CEEB, skyBottom: 0xd4efc7, ground: 0x7ec87e, groundAlt: 0x6ab86a, pathColor: 0xc8b896,
};

export const ZONES = [
  { code: '01', name: 'WELCOME', label: 'Welcome', position: { x: 0, z: -40 }, radius: 15,
    content: { eyebrow: 'Personal Hub', title: 'The Builder Who Ships.', body: 'Six products, forty thousand words, one book — all built in sixty days. Every project is a decision. Every decision left a trace.', buttons: [] } },
  { code: '02', name: 'PROJECTS', label: 'Projects', position: { x: -25, z: -15 }, radius: 18,
    content: { eyebrow: 'Project Archive', title: 'THEPAI', body: 'AI video generation for TikTok commerce accounts. From highlight clips to AI-generated product videos targeting GMV.', buttons: [{ text: 'Visit Site', url: '#', primary: true }, { text: 'GitHub', url: '#', primary: false }], tag: { text: 'VERIFIED', variant: 'active' } } },
  { code: '03', name: 'SOULPRINT', label: 'Soulprint', position: { x: 25, z: -15 }, radius: 15,
    content: { eyebrow: 'Soulprint', title: 'Conversational Bazi Bot', body: 'RAG-powered Chinese astrology using classical texts. Not internet noise — original source material only.', buttons: [{ text: 'Try on Telegram', url: '#', primary: true }], tag: { text: 'PROTOTYPE', variant: 'muted' } } },
  { code: '04', name: 'THEATER', label: 'Theater', position: { x: 0, z: 8 }, radius: 15,
    content: { eyebrow: 'Content Theater', title: 'Articles & Videos', body: 'WeChat articles, video essays, and curated playlists from the building journey.', buttons: [{ text: 'Read Latest', url: '#', primary: true }] } },
  { code: '05', name: 'LIBRARY', label: 'Library', position: { x: -25, z: 30 }, radius: 15,
    content: { eyebrow: 'Library', title: 'Understanding Large Models', body: 'From Karpathy notes to a full AI primer — 8 chapters with 2026 real-world cases. v17 epub available.', buttons: [{ text: 'Download epub', url: '#', primary: true }], tag: { text: 'V17', variant: 'active' } } },
  { code: '06', name: 'SOCIAL', label: 'Social', position: { x: 25, z: 30 }, radius: 15,
    content: { eyebrow: 'Social', title: 'Find Me', body: 'X, Xiaohongshu, Weibo, GitHub — wherever you prefer.', buttons: [{ text: 'X / Twitter', url: '#', primary: false }, { text: 'GitHub', url: '#', primary: false }, { text: 'Xiaohongshu', url: '#', primary: false }] } },
  { code: '07', name: 'HIRE', label: 'Hire', position: { x: 0, z: 50 }, radius: 15,
    content: { eyebrow: 'Hire / Contact', title: 'Work Together', body: 'Open to collaboration, consulting, and interesting projects.', buttons: [{ text: 'Submit', url: '#', primary: true }], hasForm: true } },
];

export const CAMERA = { fov: 60, near: 0.1, far: 500, startPosition: { x: 0, y: 2, z: -50 }, moveSpeed: 0.12, height: 2 };
export const WORLD = { size: 200, treeCount: 60, grassPatchCount: 40 };
