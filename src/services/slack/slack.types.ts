export interface EditedMessage {
    ts: string;
    type: string;
    user: string;
    text: string;
}

export interface RTMMessage {
    type: string;
    channel: string;
    user: string;
    bot_id: string;
    text: string;
    ts: string;

    // which one?
    team: string;
    team_id: string;
    source_team: string;

    subtype: string;

    // deleted
    deleted_ts: string;

    // changed
    message: EditedMessage;
}

export interface User {
    id: string;
    name: string;
    team_id: string;
    profile: UserProfile;

    status_emoji: string;
    status_text: string;
}

export interface Bot {
    id: string;
    name: string;

    icons: BotIcons;
}

export interface BotIcons {
    image_36: string;
    image_48: string;
    image_72: string;
}

export interface UserProfile {
    email: string;

    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
}

export interface Channel {
    id: string;
    name: string;
    members: string[];

    is_archived: boolean;
    is_channel: boolean;
    is_member: boolean;
    is_org_shared: boolean;
    is_shared: boolean;
}

export interface Icons {
    image_32: string;
    image_44: string;
    image_68: string;
    image_88: string;
    image_102: string;
    image_132: string;
    image_230: string;
    image_default: boolean;
}

export interface Team {
    id: string;
    name: string;
    email_domain: string;
    domain: string;
    avatar_base_url: string;
    icon: Icons;
    plan: string;
}

export interface Group {
    id: string;
    name: string;
    name_normalized: string;
    created: number;
    creater: string;

    has_pins: boolean;
    is_archived: boolean;
    is_group: boolean;
    is_mpim: boolean;
    is_open: boolean;

    members: string[];
}

export interface DM {
    id: string;

    is_im: boolean;
    is_open: boolean;
    is_org_shared: boolean;

    user: string;
}

export interface DataStore {
    getUserById(id: string): User;
    getUserByName(name: string): User;
    getUserByEmail(email: string): User;
    getUserByBotId(botId: string): User;
    getChannelById(channelId: string): Channel;
    getChannelByName(name: string): Channel;
    getGroupById(groupId: string): Group;
    getGroupByName(name: string): Group;
    getDMById(dmId: string): DM;
    getDMByName(name: string): DM;
    getDMByName(userId: string): DM;
    getBotById(botId: string): Bot;
    getBotByName(name: string): Bot;
    getBotByUserId(userId: string): Bot;
    getTeamById(name: string): Team;
    getUnreadCount(): number;
}
