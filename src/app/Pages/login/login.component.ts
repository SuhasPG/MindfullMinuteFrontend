// login.component.ts for Angular 18
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading = false;
  showPassword = false;
  submitted = false;
  rememberMe = false;
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
    
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Handle container click (from original code)
  onContainerClick() {
    console.log('Container clicked');
  }

  // Handle login form submission
  onLogin() {
    this.submitted = true;
    this.errorMessage = '';

    // Basic form validation
    if (!this.email || !this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    // Show loading indicator
    this.loading = true;

    // Handle "remember me" functionality
    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', this.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Use AuthService for login
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;
        // Navigate to the return URL or dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = error.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }

  // Method to validate email format
  public validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  // Handle forgot password
  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Navigate to signup page
  goToSignup(): void {
    this.router.navigate(['/register']);
  }
}