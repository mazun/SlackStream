import { Component } from '@angular/core';
import { SlackServiceCollection } from '../services/slack/slack.service';
import { RTMMessage, DataStore } from '../services/slack/slack.types';

@Component({
  selector: 'ss-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages: RTMMessage[];
  count: number = 0;

  constructor(private services: SlackServiceCollection) {
    this.messages = [];

    services.slacks.forEach(slack => {
      slack.start();
      slack.messages.subscribe(message => this.onReceiveMessage(message));
    });
  }

  onReceiveMessage(data: [RTMMessage, DataStore]): void {
    const [message, dataStore] = data;

    const user = dataStore.getUserById(message.user);
    const channel = dataStore.getChannelById(message.channel);
    const userName = user ? user.name : '???';
    const team = dataStore.getTeamById(message.source_team);
    const teamName = team ? team.name : '???';
    const group = dataStore.getGroupById(message.channel);
    const channelName = channel ? channel.name : group ? group.name : 'DM';
    console.log(`${userName} #${channelName} (${teamName}): ${message.text}`);

    this.messages.push(message);
    console.log(this.messages.length);
    this.count = this.messages.length;
  }
}
