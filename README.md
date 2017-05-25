# ASlack-Stream

Another/Angular Slack Stream is another implimentation of https://github.com/TazuKongari/Slack-Stream

## How to use

1. [Get your Slack token(s)](https://api.slack.com/custom-integrations/legacy-tokens)
2. Install Node.js
3. Git clone this repository and run the following commands

```shell
cd path-to-this-reposritory
yarn install

# Set your api token(s)
cp src/services/slack/token.ts.sample src/services/slack/token.ts
vi src/services/slack/token.ts

# Run server
yarn start

# Run electron (in another shell)
yarn electron
```
