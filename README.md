# Slack Stream

Ever had troubles clicking the slack client many times to find the conversation you're looking for?

Slack Stream, an all-at-a-glance slack client, is just for you!

## Screenshot

- y.mazun belongs to two teams
- Messages of all channels in the two teams are shown in place like a *stream*

![SS](https://github.com/mazun/SlackStream/blob/master/images/screenshot01.png)

## Features

- All messages of any channnel and any team are shown in a single column
- Multi-platform. Runs on Windows, Mac and Linux
- Open a channel in the official slack client by clicking the channel name
- Many features you can use in the official client are implemented
  - Posting messages
  - Emoji and username completion
  - Reaction by posting +:some-emoji: or by clicking an existing reaction
  - etc.

## Download

### Stable Releases

https://github.com/mazun/SlackStream/releases

### Nightly Builds (based on the latest commit)

http://1341shangrila.dip.jp/slackstream/build

## Keyboard shortcuts

- **Ctrl+Alt+Enter**:
Activate the SlackStream window and open a message writing form (the target channel is the channel of the latest message).
You can use this shortcut even when Slack-Stream window is not active.

- **↑**:
Edit the latest message you've sent.

- **Alt+↑/↓(when inputing your message)**:
Change the target channel.


## For developers

1. Install Node.js and yarn
2. Git clone this repository and run the following commands

```shell
cd path-to-this-reposritory
yarn install

# Start dev-server
yarn start

# Run electron (in another shell)
ENV=development yarn electron
```

## Old repository

https://github.com/TazuKongari/Slack-Stream

## Mascot Character

<img src="https://github.com/mazun/SlackStream/blob/master/images/ss-chan.png" height="256px">
