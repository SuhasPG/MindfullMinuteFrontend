// services/exercise.service.ts
import { Injectable, signal } from '@angular/core';
import { Exercise } from '../Models/exercise';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private exercises: Exercise[] = [
    {
      id: 1,
      title: 'Deep Breathing',
      description:
        'A simple but powerful exercise to center yourself and reduce stress.',
      steps: [
        'Find a comfortable seated position.',
        'Close your eyes and take a deep breath in through your nose for 4 counts.',
        'Hold your breath for 2 counts.',
        'Exhale slowly through your mouth for 6 counts.',
        'Repeat for 1–2 minutes.',
      ],
      duration: 2,
      imageUrl: 'assets/images/breathing.jpg',
    },
    {
      id: 2,
      title: 'Body Scan',
      description:
        'A mindfulness practice to increase awareness of your body and release tension.',
      steps: [
        'Lie down or sit comfortably.',
        'Close your eyes and take a few deep breaths.',
        'Beginning with your toes, focus your attention on each part of your body.',
        'Notice any sensations without judgment.',
        'Gradually move up through your entire body.',
        'End with focusing on your breath for a few moments.',
      ],
      duration: 5,
      imageUrl: 'assets/images/body-scan.jpg',
    },
    {
      id: 3,
      title: 'Gratitude Practice',
      description:
        'Shift your focus to the positive aspects of your life to boost well-being.',
      steps: [
        'Sit quietly and take a few deep breaths.',
        "Think of three things you're grateful for today.",
        'For each one, spend a moment really feeling the gratitude.',
        'Notice how this feeling affects your body and mind.',
        'Write down your gratitudes if you wish.',
      ],
      duration: 3,
      imageUrl: 'assets/images/gratitude.jpg',
    },
    {
      id: 4,
      title: 'Mindful Observation',
      description:
        'A simple exercise to connect with the environment around you.',
      steps: [
        'Choose a natural object within your immediate environment.',
        'Focus on watching it for a minute or two.',
        "Observe it as if you're seeing it for the first time.",
        'Explore its colors, patterns, textures, and shapes.',
        'Allow yourself to be fully connected to the moment.',
      ],
      duration: 2,
      imageUrl: 'assets/images/observation.jpg',
    },
  ];

  exercisesSignal = signal<Exercise[]>(this.exercises);

  constructor() {}

  getExercises(): Exercise[] {
    return this.exercises;
  }

  getExercise(id: number): Exercise | undefined {
    return this.exercises.find((exercise) => exercise.id === id);
  }
}