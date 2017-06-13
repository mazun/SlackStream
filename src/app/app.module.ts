// angulars
import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

// components
import { AppComponent } from './app.component';
import { ChannelNameComponent } from '../components/slack/channel/name.component';
import { MessageFormComponent } from '../components/slack/form/message.component';
import { SlackListComponent } from '../components/slack/list/slacklist.component';
import { SlackAttachmentComponent } from '../components/slack/attachment/attachment.component';
import { SettingComponent } from '../components/setting/setting.component';
import { TeamIconComponent } from '../components/slack/team/icon.component';

// pipes
import { ChannelColorPipe, TimeStampPipe } from '../pipes/slack';
import { SafeHtmlPipe, SafeURLPipe } from '../pipes/dom';

// services
import { SlackServiceCollection } from '../services/slack/slack.service';
import { SettingService } from '../services/setting.service';
import { GlobalEventService } from '../services/globalevent.service';

// directives
import { AutofocusDirective } from '../directives/autofocus';

const appRoutes: Routes = [
  { path: '', component: SlackListComponent },
  { path: 'setting', component: SettingComponent }
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    // components
    AppComponent,
    ChannelNameComponent,
    MessageFormComponent,
    SlackListComponent,
    SlackAttachmentComponent,
    SettingComponent,
    TeamIconComponent,

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
    GlobalEventService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
