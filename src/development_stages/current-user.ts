// Singleton для текущего пользователя (заглушка до Лабораторной 4)
let currentUserId: number | null = null;

export function getCurrentUserId(): number {
  if (currentUserId === null) {
    currentUserId = 1; 
  }
  return currentUserId;
}