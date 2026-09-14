import type { User, SavedScore } from './types';

// User helpers
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('av_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('av_user', JSON.stringify(user));
  } catch {
    // silent fail
  }
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('av_user');
  } catch {
    // silent fail
  }
}

// Scores helpers
export function getScores(): SavedScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('av_scores');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveScore(score: SavedScore): void {
  if (typeof window === 'undefined') return;
  try {
    const scores = getScores();
    scores.push(score);
    localStorage.setItem('av_scores', JSON.stringify(scores));
  } catch {
    // silent fail
  }
}
