import { Injectable } from '@angular/core';
import * as fs from 'fs';

let settingPath: string = '';
export function setSettingPath(path: string) {
    settingPath = path;
}

interface Setting {
    tokens: string[];
}

@Injectable()
export class SettingService {
    setting: Setting;

    get tokens(): string[] {
        return this.setting.tokens;
    }

    constructor() {
        try {
            this.setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
            console.log(this.setting);
        } catch(e) {
            this.setting = {} as Setting;
        }

        if (!this.setting.tokens) { this.setting.tokens = ['']; }
    }

    save() {
        fs.writeFileSync(settingPath, JSON.stringify(this.setting));
    }
}
