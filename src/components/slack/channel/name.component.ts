import { Component, Input } from '@angular/core';

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
        return `slack://channel?team=${this.teamID}&id=${this.channelID}`;
    }
}
