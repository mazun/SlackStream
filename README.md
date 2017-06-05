# ASlack-Stream

Another/Angular Slack Stream is another implimentation of https://github.com/TazuKongari/Slack-Stream

![SS](https://github.com/mazun/ASlack-Stream/blob/master/images/screenshot01.png)

## Features

- Everything shown in a single window
- Multi-platform. Runs in Windows, Mac and Linux
- Multiple teams supported
- Select one channel to focus on it
- Smooth transition between Slack Stream and the official client
- Message posting
- Easily input emojis
- Web sites and images thumbnailed

## Download

https://github.com/mazun/ASlack-Stream/releases

## Keyboard shortcuts

- **Ctrl+Alt+Enter**:
Activate ASlack-Stream window and open message writing form (target channel is the channel of latest message).
You can use this shortcut even when ASlack-Stream window is not active.

- **↑**:
Edit latest your own message.

- **Alt+↑/↓(when inputing your message)**:
Change target channel.


## How to use(for developer)

1. Install Node.js
2. Git clone this repository and run the following commands

```shell
cd path-to-this-reposritory
yarn install

# Compile
yarn build

# Run electron
yarn electron
```
