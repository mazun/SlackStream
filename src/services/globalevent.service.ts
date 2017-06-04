import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import * as $ from 'jquery';

@Injectable()
export class GlobalEventService {
    get activateMessageForm(): Observable<void> {
        return this._activateMessageForm;
    }

    get keydown(): Observable<KeyboardEvent> {
        return this._keydown;
    }

    private _activateMessageForm: Subject<void>;
    private _keydown: Subject<KeyboardEvent>;

    constructor() {
        this._activateMessageForm = new Subject<void>();
        ipcRenderer.on('activate_message_form', () => {
            this._activateMessageForm.next(null);
        });

        this._keydown = new Subject<KeyboardEvent>();
        $(document).on('keydown', e => this._keydown.next(e));
    }
}
