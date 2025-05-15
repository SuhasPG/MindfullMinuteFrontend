// components/exercises/exercise-list/exercise-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../../Services/exercise.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise-list.component.html', 
  styleUrls: ['./exercise-list.component.css'],
})
export class ExerciseListComponent {
  exerciseService = inject(ExerciseService);
}
