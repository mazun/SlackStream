import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'ss-messageform',
  templateUrl: './message.component.html',
  styles: [ require('./message.component.css').toString() ],
})
export class MessageFormComponent {
    @Output() submit = new EventEmitter<string> ();
    @Output() close = new EventEmitter ();

    @Input() channelName: string = '';
    @Input() channelID: string = '';
    @Input() teamID: string = '';

    text = '';

    onClose(): void {
        this.close.emit ();
    }

    onSubmit(): void {
        this.submit.emit (this.text);
        console.log (this.text);
    }
}
