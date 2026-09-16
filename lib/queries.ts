import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/lib/types';

const LEADERBOARD_LIMIT = 100;

interface ScoreRow {
  score: number;
  created_at: string;
  users: { name: string } | { name: string }[] | null;
}

/** PostgREST devuelve la relación como objeto o como array según el join. */
function playerName(users: ScoreRow['users']): string {
  const profile = Array.isArray(users) ? users[0] : users;
  return profile?.name ?? 'ANÓNIMO';
}

function toEntry(row: ScoreRow, index: number): LeaderboardEntry {
  return {
    rank: index + 1,
    user_name: playerName(row.users),
    score: row.score,
    date: row.created_at.slice(0, 10),
  };
}

/** Top de puntuaciones de un juego, ordenado de mayor a menor. */
export async function getLeaderboard(
  gameId: string
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('score, created_at, users(name)')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(LEADERBOARD_LIMIT);

  if (error) throw error;

  return (data as ScoreRow[]).map(toEntry);
}

/** Mejor puntuación del usuario en un juego, o null si aún no tiene ninguna. */
export async function getUserBest(
  gameId: string,
  userId: string
): Promise<{ score: number; date: string } | null> {
  const { data, error } = await supabase
    .from('scores')
    .select('score, created_at')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { score: data.score, date: data.created_at.slice(0, 10) };
}

/** Guarda una puntuación del usuario autenticado. */
export async function saveScore(
  gameId: string,
  userId: string,
  score: number
): Promise<void> {
  const { error } = await supabase
    .from('scores')
    .insert({ user_id: userId, game_id: gameId, score });

  if (error) throw error;
}
