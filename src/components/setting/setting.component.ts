import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../services/setting.service';

@Component({
    selector: 'ss-setting',
    templateUrl: './setting.component.html',
    styles: [require('./setting.component.css').toString()]
})
export class SettingComponent implements OnInit {
    tokens: string[];
    hideButtons: boolean;

    get tokenIndexes(): number[] {
        return this.tokens.map((elem, index, array) => index);
    }

    constructor(public setting: SettingService, private router: Router) {
        this.tokens = this.setting.tokens;
        this.hideButtons = this.setting.hideButtons;
        if (this.tokens.length === 0) {
            this.tokens = [''];
        }
    }

    ngOnInit() {

    }

    addToken() {
        this.tokens.push('');
    }

    exit() {
        this.setting.setting.tokens = this.tokens;
        this.setting.setting.hideButtons = this.hideButtons;
        this.setting.save();
        this.router.navigate(['/']);
    }

    removeToken(index: number) {
        this.tokens.splice(index, 1);
    }
}
