import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SlackService, DisplaySlackMessageInfo, DisplaySlackReactionInfo } from '../../../services/slack/slack.service';
import { SlackClient } from '../../../services/slack/slack-client';

import { GlobalEventService } from '../../../services/globalevent.service';

import { Subscription } from 'rxjs';
import { SettingService } from '../../../services/setting.service';
import { SubmitContext, PostMessageContext, EditMessageContext } from './submit-context';
import { FilterContext, SoloChannelFilterContext, NoFilterContext } from './filter-context';

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

    get messages(): DisplaySlackMessageInfo[] {
        return this.slack.infos;
    }

    get soloMode(): boolean {
        return this.filterContext.soloMode;
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
            this.messages
        );
        this.detector.detectChanges();
    }

    onClickSendDM(info: DisplaySlackMessageInfo) {
        this.submitContext = new PostMessageContext(
            info.client,
            '@' + info.message.userName,
            info.message.teamID,
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
        }
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

    onChangeChannelRequest(next: boolean) {
        if (this.submitContext) {
            this.submitContext.changeChannelRequest(next);
        }
        this.detector.detectChanges();
    }
}
