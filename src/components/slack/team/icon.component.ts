import { Component, Input } from '@angular/core';
import { DataStore, Team } from '../../../services/slack/slack.types';

@Component({
    selector: 'ss-teamicon',
    templateUrl: './icon.component.html',
    styles: [ require('./icon.component.css').toString() ]
})
export class TeamIconComponent {
    @Input() teamID: string;
    @Input() dataStore: DataStore;

    get team(): Team {
        return this.dataStore.getTeamById(this.teamID);
    }

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
