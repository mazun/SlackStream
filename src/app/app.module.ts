import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

// components
import { AppComponent } from './app.component';

// services
import { SlackServiceCollection } from '../services/slack/slack.service';
import { SettingService } from '../services/setting.service';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    SettingService,
    SlackServiceCollection
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
