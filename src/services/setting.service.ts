import { Injectable } from '@angular/core';
import { RadioButton, RadioButtonFactory } from '../components/setting/radiobutton/radiobutton';
import * as fs from 'fs';

let settingPath = '';
export function setSettingPath(path: string) {
    settingPath = path;
}

interface Setting {
    tokens: string[];
    hideButtons: boolean;
    imageExpansionSize: RadioButton;
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

    get imageExpansionSize(): RadioButton {
        return this.setting.imageExpansionSize;
    }

    set imageExpansionSize(imageExpansionSize: RadioButton) {
        this.setting.imageExpansionSize = imageExpansionSize;
    }

    constructor() {
        try {
            this.setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
        } catch (e) {
            this.setting = {} as Setting;
        }

        if (this.tokens === undefined) { this.tokens = ['']; }
        if (this.hideButtons === undefined) { this.hideButtons = false; }
        if (this.imageExpansionSize === undefined) {
            this.imageExpansionSize = RadioButtonFactory.get('Image Expansion', ['Normal', 'Small', 'Never'], 'Normal');
        }
    }

    save() {
        fs.writeFileSync(settingPath, JSON.stringify(this.setting));
    }
}
