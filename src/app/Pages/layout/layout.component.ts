import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../Services/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  // isTokenPresent: boolean = false;

  // constructor(private router: Router) {
  //   this.isTokenPresent = !!localStorage.getItem('access_token');
  // }

  // onLogout() {
  //   localStorage.removeItem('access_token');
  //   this.isTokenPresent = false;
  //   this.router.navigate(['/login']);
  // }
  authService = inject(AuthService);
}
