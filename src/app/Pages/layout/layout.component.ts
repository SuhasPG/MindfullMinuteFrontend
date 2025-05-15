import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isTokenPresent: boolean = false;

  constructor(private router: Router) {
    this.isTokenPresent = !!localStorage.getItem('token');
  }

  onLogout() {
    localStorage.removeItem('token');
    this.isTokenPresent = false;
    this.router.navigate(['/login']);
  }
}
