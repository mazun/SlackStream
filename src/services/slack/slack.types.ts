export interface EditedMessage {
    ts: string;
    type: string;
    user: string;
    text: string;
    attachments: Attachment[];
}

export interface Attachment {
    ts: string;

    color: string;

    fallback: string;
    from_url: string;

    id: number;

    service_icon: string;
    service_name: string;

    text: string;
    pretext: string;

    image_url: string;
    thumb_height: number;
    thumb_url: string;
    thumb_width: number;

    title: string;
    title_link: string;

    author_id: string;
    author_icon: string;
    author_link: string;
    author_name: string;
    author_subname: string;

    footer: string;
    footer_icon: string;
}

export interface FileDescription {
    id: string;

    mimetype: string;
    url_private: string;

    thumb_64: string;
    thumb_80: string;
    thumb_160: string;
    thumb_360: string;
    thumb_480: string;
}

export interface Comment {
    id: string;
    comment: string;
    user: string;
}

export interface RTMMessage {
    type: string;
    channel: string;
    user: string;
    bot_id: string;
    text: string;
    ts: string;
    thread_ts: string;

    attachments: Attachment[];
    comment: Comment;

    files: FileDescription[];

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

export interface ReactionTarget {
    type: string;
}

// if type is message
export interface MessageReactionTarget extends ReactionTarget {
    channel: string;
    ts: string;
}

// if type is file
export interface FileReactionTarget extends ReactionTarget {
    file: string;
}

// if type is file_comment
export interface FileCommentReactionTarget extends ReactionTarget {
    file: string;
    file_comment: string;
}

export interface RTMReactionBase {
    event_ts: string;
    item: ReactionTarget;
    item_user: string;
    reaction: string;
    ts: string;
    type: string;
    user: string;
}

export interface RTMReactionAdded extends RTMReactionBase {

}

export interface RTMReactionRemoved extends RTMReactionBase {
}

export interface RTMEmojiChanged {
    type: string;
    subtype: string;
    event_ts: string;
}

export interface RTMEmojiAdded extends RTMEmojiChanged {
    name: string;
    value: string;
}

export interface RTMEmojiRemoved extends RTMEmojiChanged {
    names: string[];
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

    display_name: string;
    real_name: string;
}

export interface Members {
    members: string[];
}

export interface Channel extends Members {
    id: string;
    name: string;

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

export interface Group extends Members {
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
}

export interface DM {
    id: string;

    is_im: boolean;
    is_open: boolean;
    is_org_shared: boolean;

    user: string;
}

export interface DataStore {
    teamID: string;

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
