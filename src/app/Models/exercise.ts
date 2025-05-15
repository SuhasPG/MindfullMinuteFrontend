export interface Exercise {
    id: number;
    title: string;
    description: string;
    steps: string[];
    duration: number; // in minutes
    imageUrl?: string;
  }
  