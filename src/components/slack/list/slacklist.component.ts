import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SlackService, DisplaySlackMessageInfo, DisplaySlackReactionInfo } from '../../../services/slack/slack.service';
import { SlackClient } from '../../../services/slack/slack-client';
import { SlackUtil } from '../../../services/slack/slack-util';

import { GlobalEventService } from '../../../services/globalevent.service';

import { Subscription } from 'rxjs';
import { SettingService } from '../../../services/setting.service';
import { SubmitContext, PostMessageContext, EditMessageContext } from './submit-context';
import { FilterContext, SoloChannelFilterContext, NoFilterContext, MuteChannelFilterContext } from './filter-context';

@Component({
    selector: 'ss-list',
    templateUrl: './slacklist.component.html',
    styles: [require('./slacklist.component.css').toString()],
})
export class SlackListComponent implements OnInit, OnDestroy {
    slackServices: SlackClient[];
    submitContext: SubmitContext = null;
    filterContext: FilterContext = new NoFilterContext();
    subscription = new Subscription();
    submitting: boolean;
    showingReactedUsers: any;
    mutedChannels: string[] = [];
    mutedChannelNames: string[] = [];

    get messages(): DisplaySlackMessageInfo[] {
        return this.slack.infos;
    }

    get soloMode(): boolean {
        return this.filterContext.soloMode;
    }

    get muteMode(): boolean {
        return this.filterContext.muteMode;
    }

    get filteredMessages(): DisplaySlackMessageInfo[] {
        return this.messages.filter(m => this.filterContext.shouldShow(m));
    }

    get doesHaveMultipleTeams(): boolean {
        return this.slackServices.length >= 2;
    }

    get showTeamName(): boolean {
        return false;
    }

    selected(info: DisplaySlackMessageInfo): boolean {
        return this.submitContext && this.submitContext.teamID === info.message.teamID && this.submitContext.ts === info.message.ts;
    }

    constructor(
        private slack: SlackService,
        private events: GlobalEventService,
        private detector: ChangeDetectorRef,
        private router: Router,
        private setting: SettingService
    ) {
        this.slack.refresh();
        this.slackServices = slack.clients;
    }

    ngOnInit(): void {
        if (this.slackServices.length === 0) {
            this.router.navigate(['/setting']);
            return;
        }

        this.subscription.add(this.slack.onChange.subscribe(s => this.onChange(s)));
        this.subscription.add(this.events.activateMessageForm.subscribe(() => this.activateMessageForm()));
        this.subscription.add(this.events.keydown.filter(e => e.which === 38).subscribe(() => this.editLatestMessage()));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    get showForm(): boolean {
        return this.submitContext != null;
    }

    onChange(slack: SlackService): void {
        this.detector.detectChanges();
    }

    onClickWrite(info: DisplaySlackMessageInfo) {
        this.submitContext = new PostMessageContext(
            info.client,
            info.message.channelID,
            info.message.teamID,
            info.message.ts,
            this.filteredMessages
        );
        this.detector.detectChanges();
    }

    onClickSendDM(info: DisplaySlackMessageInfo) {
        this.submitContext = new PostMessageContext(
            info.client,
            '@' + info.message.userName,
            info.message.teamID,
            info.message.ts,
            this.messages
        );
        this.detector.detectChanges();
    }

    onClickDelete(info: DisplaySlackMessageInfo) {
        this.slack.deleteMessage(info.message, info.client);
    }

    onClickSoloMode(info: DisplaySlackMessageInfo) {
        if (this.filterContext.soloMode) {
            this.filterContext = new NoFilterContext();
        } else {
            this.filterContext = new SoloChannelFilterContext(info.message.channelID);
            this.mutedChannels = [];
            this.mutedChannelNames = [];
        }
        this.detector.detectChanges();
    }

    onClickDisableMuteMode(channelName: string) {
        const index = this.mutedChannelNames.findIndex((elm, index, array) => { return channelName === elm; });

        this.mutedChannels.splice(index, 1);
        this.mutedChannelNames.splice(index, 1);

        if (this.mutedChannels.length === 0) {
            this.filterContext = new NoFilterContext();
        }
        else {
            this.filterContext = new MuteChannelFilterContext(this.mutedChannels);
        }
        this.detector.detectChanges();
    }

    onClickMuteMode(info: DisplaySlackMessageInfo) {
        this.mutedChannels.push(info.message.channelID);
        this.mutedChannelNames.push(SlackUtil.getChannelName(info.message.channelID, info.message.dataStore));
        this.filterContext = new MuteChannelFilterContext(this.mutedChannels);
        this.detector.detectChanges();
    }

    onClickEdit(info: DisplaySlackMessageInfo) {
        this.submitContext = new EditMessageContext(info.client, info.message);
        this.detector.detectChanges();
    }

    async submitForm(text: string) {
        if (this.submitContext != null) {
            this.submitting = true;
            this.detector.detectChanges();

            await this.submitContext.submit(text).catch(
                // slack server may have returned an error. print the error and continue
                (e) => { console.log(e); });

            this.submitting = false;
            this.submitContext = null;
            this.detector.detectChanges();
        }
    }

    closeForm() {
        this.submitContext = null;
        this.detector.detectChanges();
    }

    onClickReaction(reaction: DisplaySlackReactionInfo) {
        const client = reaction.target.client;
        if (!reaction.includeMine) {
            client.addReaction(reaction.rawReaction, reaction.target.message.channelID, reaction.target.message.ts);
        } else {
            client.removeReaction(reaction.rawReaction, reaction.target.message.channelID, reaction.target.message.ts);
        }
    }

    onMouseEnterReaction(reaction: DisplaySlackReactionInfo) {
        reaction.showReactedUsers = true;
        this.showingReactedUsers = setTimeout(() => {
            this.detector.detectChanges();
        }, 500);
    }

    onMouseLeaveReaction(reaction: DisplaySlackReactionInfo) {
        reaction.showReactedUsers = false;
        clearTimeout(this.showingReactedUsers);
        this.detector.detectChanges();
    }

    activateMessageForm() {
        if (this.submitContext === null) {
            const messages = this.filteredMessages;
            if (messages.length !== 0) {
                const message = messages[0];
                this.submitContext = new PostMessageContext(
                    message.client,
                    message.message.channelID,
                    message.message.teamID,
                    message.message.ts,
                    messages
                );
                this.detector.detectChanges();
            }
        }
    }

    editLatestMessage() {
        if (this.submitContext === null) {
            for (const info of this.messages) {
                if (info.message.mine) {
                    this.onClickEdit(info);
                    return;
                }
            }
        }
    }

    onChangeMessageRequest(next: boolean) {
        if (this.submitContext) {
            this.submitContext.changeMessageRequest(next);
        }
        this.detector.detectChanges();
    }

    onChangeChannelRequest(next: boolean) {
        if (this.submitContext) {
            this.submitContext.changeChannelRequest(next);
        }
        this.detector.detectChanges();
    }

    onClickSetting() {
        this.router.navigate(['setting']);
    }
}
