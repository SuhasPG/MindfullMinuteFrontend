import { Component, inject } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [DashboardComponent],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  router = inject(Router);

  constructor() {
    // Redirect to the dashboard after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      alert('Redirecting to dashboard...');
    }, 3000);
  }
}
