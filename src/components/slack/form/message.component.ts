import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-textcomplete';
import { EmojiService } from '../../../services/slack/emoji.service';
import { DM, DataStore, Members } from '../../../services/slack/slack.types';
import { SlackUtil } from '../../../services/slack/slack-util';

@Component({
    selector: 'ss-messageform',
    templateUrl: './message.component.html',
    styles: [require('./message.component.css').toString()],
})
export class MessageFormComponent implements OnChanges, OnDestroy {
    @Output() submit = new EventEmitter<string>();
    @Output() close = new EventEmitter();
    @Output() changeChannel = new EventEmitter<boolean>();
    @Output() changeMessage = new EventEmitter<boolean>();
    @Output() searchChannel = new EventEmitter();

    @Input() channelLikeID: string;
    @Input() dataStore: DataStore;

    @Input() teamID: string = '';
    @Input() initialText: string = '';
    @Input() extraInfo: string = '';
    @Input() emoji: EmojiService;
    @Input() enable: boolean;
    @Input() subTeams: string[] = [];

    get channel(): Members {
        const channel = this.dataStore.getChannelById(this.channelLikeID);
        if (channel) { return channel; }
        return this.dataStore.getGroupById (this.channelLikeID);
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
        const freq = this.emoji.usedFrequency;
        const users = this.subTeams.concat(this.channel ? this.channel.members.map(m => this.dataStore.getUserById(m).name) : []);

        $('#slack_message_input').textcomplete('destroy');
        $('#slack_message_input').textcomplete([
            { // emojis
                match: /\B:([\-+\w]*)$/,
                search: (term, callback) => {
                    callback(emojis.filter(emoji => emoji.indexOf(term) !== -1)
                             .sort((a, b) => {
                                 // two sort criteria (frequency, length) used together,
                                 // but cannot be separated to two .sort()s because
                                 // .sort() seems not "stable" in some environments
                                 const f1 = (freq[a] ? freq[a] : 0);
                                 const f2 = (freq[b] ? freq[b] : 0);
                                 if (f1 !== f2) {
                                     return f2 - f1;
                                 } else {
                                     return a.length - b.length;
                                 }
                             }));
                },
                template: (value) => {
                    let shortName: string;
                    if (value.length > 15) {
                        shortName = value.substr(0, 15) + '...';
                    } else {
                        shortName = value;
                    }
                    return `${this.emoji.convertEmoji(':' + value + ':')} ${shortName}`;
                },
                replace: (value) => {
                    this.emoji.useEmoji(value);
                    return ':' + value + ': ';
                },
                index: 1
            },
            { // usernames
                match: /\B\@([_a-zA-Z\.]*)$/,
                search: (term, callback) => {
                    callback(users.filter(user => term === '' || user.indexOf(term) !== -1)
                        .sort((a, b) => a.length - b.length));
                },
                template: (value) => {
                    return '@' + value;
                },
                replace: (value) => {
                    return '@' + value + ' ';
                },
                index: 1
            }
        ]);
    }

    ngOnDestroy(): void {
        // There remains gabage dom related to textcomplete.
        // We want to destoy by `$('#slack_message_input').textcomplete('destroy')`,
        // but it seems not to work in ngOnDestroy.
        $('ul.dropdown-menu').remove();
    }

    onClose(): void {
        this.close.emit();
    }

    onSubmit(value: string): void {
        if (this.enable) {
            this.submit.emit(value);
        }
    }

    onKeyDown(event: KeyboardEvent, textArea: any): void {
        // Windows sends only keydown event (not keypress event) in pressing Alt/Ctrl/Shift keys
        if (process.platform !== 'darwin') {
            if (event.key === 'Enter' && $('.textcomplete-dropdown').css('display') === 'none') {
                if (event.altKey || event.shiftKey || event.ctrlKey) {
                    this.addNewline(textArea);
                }
            }
        }
    }

    onKeyPress(event: KeyboardEvent, textArea: any): void {
        this.handleEnter(event, textArea);
    }

    onKeyUp(event: KeyboardEvent, textArea: any): void {
        if (event.which === 27) {
            this.close.emit();
        } else if (event.altKey) {
            if (event.which === 38) { // up
                event.preventDefault();
                this.changeMessage.emit(false);
            } else if (event.which === 40) { // down
                event.preventDefault();
                this.changeMessage.emit(true);
            } else if (event.which === 37) { // left
                event.preventDefault();
                this.changeChannel.emit(false);
            } else if (event.which === 39) { // right
                event.preventDefault();
                this.changeChannel.emit(true);
            }
        }
    }

    handleEnter(event: KeyboardEvent, textArea: any): void {
        if (event.key === 'Enter' && $('.textcomplete-dropdown').css('display') === 'none') {
            if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
                this.onSubmit(textArea.value.replace(/[<>&]/g,
                    (c: string) => {
                        if (c === '&') {
                            return '&amp;';
                        } else if (c === '<') {
                            return '&lt;';
                        } else {
                            return '&gt;';
                        }
                    }));
            } else if (process.platform === 'darwin') {
                this.addNewline(textArea);
            }
            event.preventDefault();
        }
    }

    addNewline(textArea): void {
        const position: number = textArea.selectionStart;
        const text: string = textArea.value;
        textArea.value = text.substr(0, position) + '\n' + text.substr(textArea.selectionEnd);
        textArea.selectionStart = position + 1;
        textArea.selectionEnd = position + 1;
    }

    onSearchChannelRequest(): void {
        this.searchChannel.emit();
    }
}
