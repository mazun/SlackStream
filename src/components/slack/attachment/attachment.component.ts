import { Component, Input } from '@angular/core';
import { Attachment, DataStore } from '../../../services/slack/slack.types';
import { SlackParser } from '../../../services/slack/slack-parser.service';
import { SettingService } from '../../../services/setting.service';

@Component({
    selector: 'ss-attachment',
    templateUrl: './attachment.component.html',
    styles: [require('./attachment.component.css').toString()]
})
export class SlackAttachmentComponent {
    @Input() attachment: Attachment;
    @Input() parser: SlackParser;
    @Input() attachmentTextParser: SlackParser;
    @Input() dataStore: DataStore;

    constructor(
        private setting: SettingService
    ) { }

    parse(text: string): string {
        return this.parser.parse(text, this.dataStore);
    }

    attachmentTextParse(text: string): string {
        return this.attachmentTextParser.parse(text, this.dataStore);
    }

    get authorIcon(): string {
        const author_id = this.attachment.author_id;

        if (!!author_id) {
            const user = this.dataStore.getUserById(author_id);
            return user.profile.image_32;
        } else {
            return this.attachment.author_icon;
        }
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

    get showImage(): boolean {
        if (!!this.attachment['image_url'] && this.setting.imageExpansionSize.selected !== 'Never') {
            return true;
        } else {
            return false;
        }
    }

    get smallImage(): boolean {
        return (this.setting.imageExpansionSize.selected === 'Small');
    }
}
