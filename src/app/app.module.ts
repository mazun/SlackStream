// angulars
import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'

// components
import { AppComponent } from './app.component';
import { ChannelNameComponent } from '../components/slack/channel/name.component';
import { MessageFormComponent } from '../components/slack/form/message.component';
import { SlackListComponent } from '../components/slack/list/slacklist.component';
import { SlackAttachmentComponent } from '../components/slack/attachment/attachment.component';

// pipes
import { ChannelColorPipe, TimeStampPipe } from '../pipes/slack';
import { SafeHtmlPipe, SafeURLPipe } from '../pipes/dom';

// services
import { SlackServiceCollection } from '../services/slack/slack.service';
import { SettingService } from '../services/setting.service';

// directives
import { AutofocusDirective } from '../directives/autofocus';

const appRoutes: Routes = [
  { path: '', component: SlackListComponent },
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    // components
    AppComponent,
    ChannelNameComponent,
    MessageFormComponent,
    SlackListComponent,
    SlackAttachmentComponent,

    // pipes
    ChannelColorPipe,
    TimeStampPipe,
    SafeHtmlPipe,
    SafeURLPipe,

    // directives
    AutofocusDirective,
  ],
  providers: [
    SettingService,
    SlackServiceCollection,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
