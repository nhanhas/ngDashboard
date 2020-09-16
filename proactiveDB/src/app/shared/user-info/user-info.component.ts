import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  // user info => should a class
  userInfo: { id: string, name: string };

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.user$
      .subscribe(value => this.userInfo = value)
  }

}
