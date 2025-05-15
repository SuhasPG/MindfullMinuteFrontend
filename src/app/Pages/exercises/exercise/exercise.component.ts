// components/exercises/exercise-detail/exercise-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExerciseService } from '../../../Services/exercise.service';
import { Exercise } from '../../../Models/exercise';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css'],
})
export class ExerciseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);

  exercise: Exercise | undefined;
  timerActive = false;
  timerInterval: any;
  remainingSeconds = 0;
  displayTime = '0:00';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (isNaN(id)) {
        this.router.navigate(['/exercises']);
        return;
      }

      this.exercise = this.exerciseService.getExercise(id);

      if (!this.exercise) {
        this.router.navigate(['/exercises']);
      }
    });
  }

  startTimer(): void {
    if (!this.exercise) return;

    this.timerActive = true;
    this.remainingSeconds = this.exercise.duration * 60;
    this.updateDisplayTime();

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplayTime();

      if (this.remainingSeconds <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer(): void {
    clearInterval(this.timerInterval);
    this.timerActive = false;
  }

  private updateDisplayTime(): void {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    this.displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
