# ASlack-Stream

Another/Angular Slack Stream is another implimentation of https://github.com/TazuKongari/Slack-Stream

![SS](https://github.com/mazun/ASlack-Stream/blob/master/images/screenshot01.png)

## Features

- All messages of any channnel and any team are shown in a single column
- Multi-platform. Runs on Windows, Mac and Linux
- Open a channel in the official slack client by clicking the channel name
- Many features you can use in the official client are implimented
  - Posting messages
  - Emoji and username completion
  - Reaction by posting +:some-emoji: or by clicking an existing reaction
  - etc

## Download

### Stable

https://github.com/mazun/ASlack-Stream/releases

### Unstable latest build

http://1341shangrila.dip.jp/aslackstream/build

## Keyboard shortcuts

- **Ctrl+Alt+Enter**:
Activate ASlack-Stream window and open a message writing form (the target channel is the channel of the latest message).
You can use this shortcut even when ASlack-Stream window is not active.

- **↑**:
Edit the latest message you've sent.

- **Alt+↑/↓(when inputing your message)**:
Change the target channel.


## For developer

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
