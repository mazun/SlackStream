import { Component, Input } from '@angular/core';
import { SlackUtil} from '../../../services/slack/slack-util';

@Component({
    selector: 'ss-channelname',
    template: '<a [href]="channelURL | safeURL" [style.color]="channelName | channelColor">#{{channelName}}</a>',
    styles: [
        `a { font-weight: bold; }`,
        `a { text-decoration: none; }`,
        `a:hover { text-decoration: none; }`
    ]
})
export class ChannelNameComponent {
    @Input() channelName: string;
    @Input() channelID: string;
    @Input() teamID: string;

    get channelURL(): string {
        return SlackUtil.getChannelLink(this.teamID, this.channelID);
    }
}
