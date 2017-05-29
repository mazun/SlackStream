import { Component, Input } from '@angular/core';
import { Attachment, DataStore } from '../../../services/slack/slack.types';
import { SlackParser } from '../../../services/slack/slack-parser.service';

@Component({
    selector: 'ss-attachment',
    templateUrl: './attachment.component.html',
    styles: [require('./attachment.component.css').toString()]
})
export class SlackAttachmentComponent {
    @Input() attachment: Attachment;
    @Input() parser: SlackParser;
    @Input() dataStore: DataStore;

    parse(text: string): string {
        return this.parser.parse(text, this.dataStore);
    }

    get borderColor(): string {
        if (this.attachment.color) {
            if (this.attachment.color[0] === '#') {
                return this.attachment.color;
            } else {
                return '#' + this.attachment.color;
            }
        } else {
            return '#cccccc';
        }
    }
}
