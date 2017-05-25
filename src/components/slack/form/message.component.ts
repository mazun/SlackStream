import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

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

    text = '';

    ngOnInit(): void {
    }

    onClose(): void {
        this.close.emit ();
    }

    onSubmit(): void {
        this.submit.emit (this.text);
        console.log (this.text);
    }

    onKeyPress(event: KeyboardEvent): void {
        if(event.key == 'Enter') {
            if(!event.altKey) {
                this.onSubmit ();
                event.preventDefault ();
            } else {
                // 改行どうやって入れるの
            }
        }
    }
}
