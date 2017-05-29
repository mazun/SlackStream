import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ss-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private router: Router) {
  }

  onClickSetting() {
    this.router.navigate(['setting']);
  }
}