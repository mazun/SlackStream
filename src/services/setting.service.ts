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

    set tokens(tokens: string[]) {
        this.setting.tokens = tokens;
    }

    get hideButtons(): boolean {
        return this.setting.hideButtons;
    }

    set hideButtons(hideButtons: boolean) {
        this.setting.hideButtons = hideButtons;
    }

    get imageExpansion(): string {
        return this.setting.imageExpansion;
    }

    set imageExpansion(imageExpansion: string) {
        this.setting.imageExpansion = imageExpansion;
    }

    constructor() {
        try {
            this.setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
        } catch (e) {
            this.setting = {} as Setting;
        }

        if (this.tokens === undefined) { this.tokens = ['']; }
        if (this.hideButtons === undefined) { this.hideButtons = false; }
        if (this.imageExpansion === undefined) { this.imageExpansion = 'normal'; }
    }

    save() {
        fs.writeFileSync(settingPath, JSON.stringify(this.setting));
    }
}
