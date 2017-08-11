# Slack Stream
[![CircleCI](https://circleci.com/gh/mazun/SlackStream.svg?style=svg)](https://circleci.com/gh/mazun/SlackStream)
[[English]](https://github.com/mazun/SlackStream/blob/master/README.md)
[日本語]

目的のチャンネルを見つけるためにSlack クライアントを何度もクリックして消耗していませんか？

Slack Streamはそんなあなたのための全てを一目で確認できるクライアントです！

## スクリーンショット

- この例では y.mazun アカウントが2つのチームに所属しています
- 2つのチームの全てのチャンネルメッセージが一箇所に表示されます

![SS](https://github.com/mazun/SlackStream/blob/master/images/screenshot01.png)

## 機能

- 全てのチーム・全てのチャンネルのメッセージを一箇所に表示します
- Windows, Mac, Linux で動作します
- チャンネル名をクリックすると公式クライアントに移動できます
- 公式クライアントの多くの機能を再現しています
  - メッセージの投稿
  - 絵文字、ユーザー名の入力補完
  - +:絵文字: や絵文字のクリックによるリアクションの送信
  - 等々

## ダウンロード

### 安定版

https://github.com/mazun/SlackStream/releases

### 最新コミットの Nightly Build

http://1341shangrila.dip.jp/slackstream/build

## キーボード・ショートカット

- **Ctrl+Alt+Enter**:
SlackStream のウィンドウにフォーカスを移動し、最も上に表示されているチャンネルに対して書き込みを行うウィンドウを開きます。
SlackStream がバックグラウンドにいても動作します。

- **↑**:
最後に送信したメッセージを編集します。

- **Alt+↑/↓（書き込みウィンドウを開いた状態で）**:
書き込み対象チャンネルを移動します


## 開発者向け実行方法

1. Node.js と yarn をインストールします
2. 本リポジトリを clone し、下記のコマンドを実行します

```shell
本リポジトリのディレクトリに移動
yarn install

# yarn サーバを起動
yarn start

# electron を起動（yarn サーバとは別のシェルで実行）
ENV=development yarn electron
```

## マスコットキャラクター

<img src="https://github.com/mazun/SlackStream/blob/master/images/ss-chan.png" height="256px">
