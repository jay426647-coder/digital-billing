'use client';

export function getLang() {
  if (typeof window === 'undefined') return 'hi';
  return localStorage.getItem('appLang') || 'hi';
}

export function setLang(lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('appLang', lang);
  window.dispatchEvent(new Event('langchange'));
}

export function toggleLang() {
  const current = getLang();
  const next = current === 'hi' ? 'en' : 'hi';
  setLang(next);
  return next;
}
