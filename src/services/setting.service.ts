import { Injectable } from '@angular/core';
import * as fs from 'fs';

let settingPath = '';
export function setSettingPath(path: string) {
    settingPath = path;
}

interface Setting {
    tokens: string[];
    hideButtons: boolean;
    imageExpansion: string;
}

@Injectable()
export class SettingService {
    setting: Setting;

    get tokens(): string[] {
        return this.setting.tokens;
    }

    get hideButtons(): boolean {
        return this.setting.hideButtons;
    }

    get imageExpansion(): string {
        return this.setting.imageExpansion;
    }

    constructor() {
        try {
            this.setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
        } catch (e) {
            this.setting = {} as Setting;
        }

        if (this.setting.tokens === undefined) { this.setting.tokens = []; }
        if (this.setting.hideButtons === undefined) { this.setting.hideButtons = false; }
        if (this.setting.imageExpansion === undefined) { this.setting.imageExpansion = 'normal'; }
    }

    save() {
        fs.writeFileSync(settingPath, JSON.stringify(this.setting));
    }
}
