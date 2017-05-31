import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class GlobalEventService {
    get activateMessageForm(): Observable<void> {
        return this._activateMessageForm;
    }

    private _activateMessageForm: Subject<void>;

    constructor() {
        this._activateMessageForm = new Subject<void>();
        ipcRenderer.on('activate_message_form', () => {
            this._activateMessageForm.next(null);
        });
    }
}
