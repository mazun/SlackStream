# SlackStream
[![CircleCI](https://circleci.com/gh/mazun/SlackStream.svg?style=svg)](https://circleci.com/gh/mazun/SlackStream)
[English]
[[日本語]](https://github.com/mazun/SlackStream/blob/master/README.ja.md)

Ever had troubles clicking the slack client many times to find the conversation you're looking for?

SlackStream, an all-at-a-glance slack client, is just for you!

# Download

### Stable Releases

https://github.com/mazun/SlackStream/releases

### Nightly Builds (based on the latest commit)

http://1341shangrila.dip.jp/slackstream/build

# What is SlackStream?

- It is an alternative slack client that shows messages of all channels / teams (workplaces) you belong to in one place like a *stream*.
- In the screenshot below, the user 'y.mazun' belongs to two teams. Every message from the two teams are shown in one single window.

![SS](https://github.com/mazun/SlackStream/blob/master/images/screenshot01.png)

# Features
- All messages of all channels / teams are shown in a single window. You never have to click anywhere to find messages you're interested.
- Multi-platform. Runs on Windows, macOS, and Linux!
- Smooth interactions with the official Client (see the 'How to use' section).
- Reproduces what you see in the official client as much as possible. Emojis are supported, URLs are thumbnailed, and markdowns are propoerly interpreted.

# Set up
1. Download a SlackStream binary. Currently the stable and nightly releases do no differ that much in terms of stability, so we recommend the latest nightly build.
2. Execute SlackStream (`slack-stream` for macOS and Linux, or `slack-stream.exe` for Windows), and you'll see the setting window.

![setting window](https://github.com/mazun/SlackStream/blob/master/images/setting.png)

3. The link in the 'Token' section brings you to the 'Legacy tokens' page in your broswer. Copy the tokens there, and paste each of them by clicking 'Add new token' in the setting (Note: You have to log-in to each team on your browser in order to get the token of that team).

![retreving tokens](https://github.com/mazun/SlackStream/blob/master/images/token_web.png)

4. Click 'save' and you're ready to go! You'll see new messages from any channel / team appearing in the SlackStream window!

# How to Use
### Posting a message
- Click the pencil (![pencil button](https://github.com/mazun/SlackStream/blob/master/images/write.png)) shown in the bottom-right of each message. You can post a message to the channel to which the original message belongs.
- Also, a keyboard shortcut (Ctrl + Alt + Enter) opens a posting form to the channel to which the top-most message belongs.
- While the form is open, you can change the target channel posting by clicking the magnifying glass (![magnifying glass](https://github.com/mazun/SlackStream/blob/master/images/glass.png)) or a keyboard shortcut 'Ctrl + t'.

### Editing a message
- Click the edit button (![edit button](https://github.com/mazun/SlackStream/blob/master/images/edit.png)) shown in the bottom-right of each message. You selected and you can overwrite the message by posting an edited one.
- Also, a keyboard shortcut (:arrow_up:) opens a form to edit the latest message you have posted.

### Deleting a message
- Click the delete button (![delete button](https://github.com/mazun/SlackStream/blob/master/images/delete.png)) shown in the bottom-right of each message, and the message will be deleted.
- Also, editing the message you want to delete to an empty message will delete it.

### Sending an emoji reaction
- Posting an emoji subsequent to a '+' (e.g. `+:ok_hand:`) adds a reaction with the emoji to the message you selected.

### Sending a DM
- Clicking the name of a user will open a form where you can post a DM to the user.

### Smooth interactions with the official client
- Clicking the channel name opens the same channel in the offcial Slack client.
- Clicking the timestamp of each message opens the same message in the official Slack client.

# Hacking and contributing
See the contribution guide (to be added).

# Mascot Character

<img src="https://github.com/mazun/SlackStream/blob/master/images/ss-chan.png" height="256px">
