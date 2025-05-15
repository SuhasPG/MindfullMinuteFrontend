import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  showConfirmPassword: boolean = false;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  registrationErrorMessage: string = '';
  loading = false;
  showPassword = false;
  submitted = false;
  rememberMe = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Check if there's a saved email in localStorage for "remember me" functionality
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Handle container click
  onContainerClick() {
    console.log('Container clicked');
  }

  // Handle registration form submission
  onRegister() {
    this.submitted = true;
    this.errorMessage = '';

    // Basic email validation
    if (!this.email || !this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Password length validation
    if (!this.password || this.password.length < 6) {
      this.registrationErrorMessage = 'Password must be at least 6 characters';
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).+$/;
    if (!passwordRegex.test(this.password)) {
      this.registrationErrorMessage = 'Password must contain at least one uppercase letter, one symbol (!@#$%^&*), and one number';
      return;
    }

    // Confirm password matching validation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
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

    console.log('Email:', this.email);
    const registerData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('https://localhost:7026/register', registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // localStorage.setItem('token', response.accessToken);
        this.loading = false;
        // Navigate to the dashboard
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.registrationErrorMessage = 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  // Method to validate email format
  public validateEmail(email: string): boolean {
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return regex.test(email);
  }
  
  // Navigate to login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}