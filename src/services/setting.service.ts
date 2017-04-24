import { Injectable } from '@angular/core';
import { tokens } from './tokens';

@Injectable()
export class SettingService {
    tokens: string[];

    constructor() {
        this.tokens = tokens;
    }
}
