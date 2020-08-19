import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    // navigate to dashboard in case of logged in
    if(this.authService.isLoggedIn) { this.router.navigate(['']); }     
  }

}
