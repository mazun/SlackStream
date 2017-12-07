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
import { Team } from '../../../services/slack/slack.types';

import * as $ from 'jquery';
import 'bootstrap';
import 'select2';

class MutedChannel {
    ID: string;
    name: string;
    team: Team;
    lastTs: string;
    numUnread: number;

    constructor(private info: DisplaySlackMessageInfo, lastTs: string) {
        this.ID = info.message.channelID;
        this.name = SlackUtil.getChannelName(info.message.channelID, info.message.dataStore);
        this.team = info.message.dataStore.getTeamById(info.message.teamID);
        this.lastTs = lastTs;
        this.numUnread = 0;
    }

    get hasUnread(): boolean {
        return this.numUnread > 0;
    }
}

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
    mutedChannels: MutedChannel[] = [];

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
        const filteredByWorkplace = this.messages.filter(m => this.setting.isTokenEnabled(m.client.token));
        return filteredByWorkplace.filter(m => this.filterContext.shouldShow(m));
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

        $('.search-channel-form').select2({
            dropdownParent: $('#channel-search-modal')
        });
        $('.search-channel-form').on('change', (e) => {
            $('#channel-search-modal').modal('hide');
            this.onSelectChannelRequest($(e.target).val());
        });

        this.subscription.add(this.slack.onChange.subscribe(s => this.onChange(s)));
        this.subscription.add(this.events.activateMessageForm.subscribe(() => this.activateMessageForm()));
        this.subscription.add(this.events.keydown.filter(e => e.which === 38 && !($('#channel-search-modal').data('bs.modal') || {}).isShown).subscribe(() => this.editLatestMessage()));
        this.subscription.add(this.events.keydown.filter(e => e.ctrlKey && e.which === 84).subscribe(() => this.onSearchChannelRequest()));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    get showForm(): boolean {
        return this.submitContext != null;
    }

    onChange(slack: SlackService): void {
        this.mutedChannels.forEach((ch, index) => {
            ch.numUnread = this.messages.filter((e, i, a) => {
                if (e.message.channelID === ch.ID && Number(e.message.ts) > Number(ch.lastTs)) {
                    return true;
                }
            }).length;
        });
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
        }
        this.detector.detectChanges();
    }

    onClickDisableMuteMode(channelID: string) {
        const indexToDelete = this.mutedChannels.findIndex((elm, index, array) => { return channelID === elm.ID; });

        this.mutedChannels.splice(indexToDelete, 1);

        if (this.mutedChannels.length === 0) {
            this.filterContext = new NoFilterContext();
        } else {
            this.filterContext = new MuteChannelFilterContext(this.mutedChannels.map(ch => ch.ID));
        }
        this.detector.detectChanges();
    }

    onClickMuteMode(info: DisplaySlackMessageInfo) {
        const lastTsOfThisCh = this.messages.find((e, i, a) => {
            // typeof(e) == DisplaySlackMessageInfo
            if (info.message.channelID === e.message.channelID) {
                return true;
            }
        }).message.ts;
        this.mutedChannels.push(new MutedChannel(info, lastTsOfThisCh));
        this.filterContext = new MuteChannelFilterContext(this.mutedChannels.map(ch => ch.ID));
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

    onSelectChannelRequest(id: string) {
        let teamID = id.split('-')[0];
        let channelID = id.split('-')[1];
        let client = null;
        for (let i = 0; i < this.slackServices.length; i++) {
            if (this.slackServices[i].team.id === teamID) {
                client = this.slackServices[i];
            }
        }

        this.submitContext = null;
        this.detector.detectChanges();
        setTimeout(() => {
            this.submitContext = new PostMessageContext(
                client,
                channelID,
                teamID,
                null,
                this.filteredMessages
            );
            this.detector.detectChanges();
        }, 1);
    }

    onSearchChannelRequest() {
        $('#channel-search-modal').modal('show');
        $('.search-channel-form').each(function() {
            this.selectedIndex  = -1;
        });
        $('.search-channel-form').select2('open');
    }

    closeSearchChannelModal(): void {
        $('#channel-search-modal').modal('hide');
    }
}
