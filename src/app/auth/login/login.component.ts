import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(form: NgForm) {
    if (!form.valid) {
      this.error = 'Please enter a valid email.';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.access_token) {
          this.router.navigate(['/home']);
        } else {
          this.error = 'Failed to login: Invalid credentials.';
        }
      },
      error: (error) => {
        this.error = 'Failed to login: Invalid credentials.';
      }
    });
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}

