import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

// components
import { AppComponent } from './app.component';
import { ChannelNameComponent } from '../components/slack/channel/name.component'

// pipes
import { ChannelColorPipe, TimeStampPipe } from '../pipes/slack';
import { SafeHtmlPipe, SafeURLPipe } from '../pipes/dom';

// services
import { SlackServiceCollection } from '../services/slack/slack.service';
import { SettingService } from '../services/setting.service';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    // components
    AppComponent,
    ChannelNameComponent,

    // pipes
    ChannelColorPipe,
    TimeStampPipe,
    SafeHtmlPipe,
    SafeURLPipe,
  ],
  providers: [
    SettingService,
    SlackServiceCollection,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
