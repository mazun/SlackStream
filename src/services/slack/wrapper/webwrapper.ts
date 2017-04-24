import { WebClient } from '@slack/client';

export class WebClientWrapper {
    client: any;

    constructor(private token: string) {
        this.client = new WebClient(token);
    }
}
