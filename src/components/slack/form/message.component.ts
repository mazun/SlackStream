import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as $ from 'jquery';
import '../../../jquery.textcomplete.js';
import { default_emojies } from './default_emoji'

@Component({
  selector: 'ss-messageform',
  templateUrl: './message.component.html',
  styles: [ require('./message.component.css').toString() ],
})
export class MessageFormComponent implements OnInit {
    @Output() submit = new EventEmitter<string> ();
    @Output() close = new EventEmitter ();

    @Input() channelName: string = '';
    @Input() channelID: string = '';
    @Input() teamID: string = '';

    ngOnInit(): void {
	$('#slack_message_input').textcomplete([
        { // emojis
          match: /\B:([\-+\w]*)$/,
          search: function (term, callback) {
	    callback($.map(default_emojies, function (emoji) {
              return emoji.indexOf(term) != -1 ? emoji : null;
            }));
          },
          template: function (value) {
	      return ':' + value + ': ';
          },
          replace: function(value){
            return ':' + value + ': ';
          },
          index: 1
        }]);
    }

    onClose(): void {
        this.close.emit ();
    }

    onSubmit(value: string): void {
	this.submit.emit (value);
    }

    onKeyPress(event: KeyboardEvent, value: string): void {
        if(event.key == 'Enter') {
            if(!event.altKey) {
                this.onSubmit (value);
                event.preventDefault ();
            } else {
                // 改行どうやって入れるの
            }
        }
    }
}
