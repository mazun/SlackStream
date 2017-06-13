import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { NgForm } from '@angular/forms'; // tslint:disable-line
import * as $ from 'jquery';
import '../../../jquery.textcomplete.js';
import { EmojiService } from '../../../services/slack/slack.service';
import { Channel, DM, DataStore } from '../../../services/slack/slack.types';
import { SlackUtil } from '../../../services/slack/slack-util';

@Component({
    selector: 'ss-messageform',
    templateUrl: './message.component.html',
    styles: [require('./message.component.css').toString()],
})
export class MessageFormComponent implements OnChanges {
    @Output() submit = new EventEmitter<string>();
    @Output() close = new EventEmitter();
    @Output() changeChannel = new EventEmitter<boolean>();

    @Input() channelLikeID: string;
    @Input() dataStore: DataStore;

    @Input() teamID: string = '';
    @Input() initialText: string = '';
    @Input() extraInfo: string = '';
    @Input() emoji: EmojiService;
    @Input() enable: boolean;

    get channel(): Channel {
        return this.dataStore.getChannelById(this.channelLikeID);
    }

    get dm(): DM {
        return this.dataStore.getDMById(this.channelLikeID);
    }

    get channelName(): string {
        return SlackUtil.getChannelName(this.channelLikeID, this.dataStore);
    }

    get channelID(): string {
        return this.channelLikeID;
    }

    ngOnChanges(): void {
        const emojis = this.emoji.allEmojis;
        const users = (this.channel ? this.channel.members.map(m => this.dataStore.getUserById(m).name) : []);

        $('#slack_message_input').textcomplete('destroy');
        $('#slack_message_input').textcomplete([
            { // emojis
                match: /\B:([\-+\w]*)$/,
                search: (term, callback) => {
                    callback($.map(emojis, function (emoji) {
                        return emoji.indexOf(term) !== -1 ? emoji : null;
                    }));
                },
                template: (value) => {
                    return `${this.emoji.convertEmoji(":" + value + ":")} ${value}`;
                },
                replace: (value) => {
                    return ':' + value + ': ';
                },
                index: 1
            },
            { // usernames
                match: /\B\@([_a-zA-Z\.]*)$/,
                search: (term, callback) => {
                    callback($.map(users, user => term == "" || user.indexOf(term) !== -1 ? user : null));
                },
                template: (value) => {
                    return "@" + value;
                },
                replace: (value) => {
                    return '@' + value + ' ';
                },
            index: 1
            }
        ]);
    }

    onClose(): void {
        this.close.emit();
    }

    onSubmit(value: string): void {
        if(this.enable) {
            this.submit.emit(value);
        }
    }

    onKeyDown(event: KeyboardEvent, textArea: any): void {
        if (event.key === 'Enter') {
            if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
                this.onSubmit(textArea.value.replace(/[<>&]/g,
                                                     (c: string) => {
                                                         if(c == '&')
                                                             return '&amp;';
                                                         else if(c == '<')
                                                             return '&lt;';
                                                         else
                                                             return '&gt;';
                                                     }));
                event.preventDefault();
            } else {
                if (!event.shiftKey) {
                    textArea.value += '\n';
                }
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.which === 27) {
            this.close.emit();
        } else if (event.which === 38) {
            // up
            if(event.altKey) {
                event.preventDefault();
                this.changeChannel.emit(false);
            }
        } else if (event.which === 40) {
            // down
            if(event.altKey) {
                event.preventDefault();
                this.changeChannel.emit(true);
            }
        }
    }
}
