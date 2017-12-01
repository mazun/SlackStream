import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService, Token } from '../../services/setting.service';

@Component({
    selector: 'ss-setting',
    templateUrl: './setting.component.html',
    styles: [require('./setting.component.css').toString()]
})
export class SettingComponent implements OnInit {
    get tokenIndexes(): number[] {
        return this.setting.tokens.map((elem, index, array) => index);
    }

    constructor(public setting: SettingService, private router: Router) {
    }

    ngOnInit() {

    }

    addToken() {
        this.setting.tokens.push({ value: '', enabled: true } as Token);
    }

    exit() {
        this.setting.save();
        this.router.navigate(['/']);
    }

    removeToken(index: number) {
        this.setting.tokens.splice(index, 1);
    }

    toggleToken(index: number) {
        const currentlyEnabled =  this.setting.tokens[index].enabled;

        if (currentlyEnabled) {
            this.setting.tokens[index].enabled = false;
        } else {
            this.setting.tokens[index].enabled = true;
        }
    }
}
