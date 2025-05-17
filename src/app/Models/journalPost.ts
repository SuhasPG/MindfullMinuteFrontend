export interface JournalPost {
    title: string;
    content: string;
    moodEmoji: 'Happy' | 'Sad' | 'Angry' | 'Anxious' | 'Excited' | 'Calm';
}