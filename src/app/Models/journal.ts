export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  moodEmoji: 'Happy' | 'Sad' | 'Angry' | 'Anxious' | 'Excited' | 'Calm';
  createdAt: Date;
}
