import { Pipe, PipeTransform } from '@angular/core';
import { SlackUtil } from '../services/slack/slack-util';

import * as dateformat from 'dateformat';

@Pipe({ name: 'channelColor' })
export class ChannelColorPipe implements PipeTransform {
    transform(value: string): string {
        return SlackUtil.channelColor(value);
    }
}

@Pipe({ name: 'ts2time' })
export class TimeStampPipe implements PipeTransform {
    transform(value: string): string {
        const date = SlackUtil.ts2date(value);
        return dateformat(date, 'HH:MM');
    }
}
