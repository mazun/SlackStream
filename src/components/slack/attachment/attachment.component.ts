import { Component, Input } from '@angular/core';
import { Attachment } from '../../../services/slack/slack.types';


@Component({
    selector: 'ss-attachment',
    templateUrl: './attachment.component.html',
    styles: [ require('./attachment.component.css').toString() ]
})
export class SlackAttachmentComponent {
    @Input() attachment: Attachment;
    // TODO: parse text
}