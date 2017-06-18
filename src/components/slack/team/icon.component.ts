import { Component, Input } from '@angular/core';
import { Team } from '../../../services/slack/slack.types';

@Component({
    selector: 'ss-teamicon',
    templateUrl: './icon.component.html',
    styles: [ require('./icon.component.css').toString() ]
})
export class TeamIconComponent {
    @Input() team: Team;

    get teamName(): string {
        return this.team ? this.team.name : '?';
    }

    get shortTeamName(): string {
        return this.team ? this.team.name[0] : '?';
    }

    get teamThumbnail(): string {
        return this.team ? this.team.icon.image_68 : '';
    }

    get teamHasThumbnail(): boolean {
        return this.team ? !this.team.icon.image_default : false;
    }
}
