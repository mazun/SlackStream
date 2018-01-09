# Contribution Guide

This document provides how to hack SlackStream and guidelines for contributing.

# How to build SlackStream by yourself
1. First, install `node` and `yarn`using either their official packages or the package manager of your operating system.
2. Clone the source tree into a local directory.

```
~$ git clone https://github.com/mazun/SlackStream
```

3. Dig into the cloned source tree and install dependencies using `yarn`.

```
~$ cd SlackStream
~/SlackStream$ yarn install
```

4. Build the code. You get some warnings, but never mind them unless you get an error.
This command does not stop but it rather keeps running and re-builds the code as soon as a source file is modified. 
**The typical usage is to keep it running during the whole period of your development.**

```
~/SlackStream$ yarn start
...
webpack: Compiled with warnings.
```

5. Open another shell window (or terminal) and run the just-built binary in the development mode.
This mode enables the debug console where you can examine debug prints and generated DOMs.

```
~/SlackStream$ ENV=development yarn electron
```

# Some hints for happy hacking
- In many cases, what you want to hack is either in `src/components` or `src/services`.
If you modify something in another directory, it is pretty much the case that you are doing something wrong.
- SlackStream uses the Angular4 framework.
The code in `src/components` are responsible to the views (e.g. displaying messages) and the code in `src/services` are responsible to the models behind (e.g. receiving messages).
- We use [node-slack-sdk](https://github.com/slackapi/node-slack-sdk) to communicate with the Slack APIs.
The basic design is to wrap the sdk by the code in `src/services/slack/wrapper` in order to fit it to the asynchronous model of Angular.
**An important notice is that the vanilla sdk does not work with webpack, so we use [our hacked version](https://github.com/mazun/node-slack-sdk/tree/slack-stream).**

# Contribution guidelines
1. If you've found a bug or developed a new feature, please do not hesitate to share them with us. Your contributions are very much appreciated.
2. Before sending a PR, please check the coding style by executing `yarn lint` in the root directory of the source tree.
Other than the coding style check, we currently have no test cases that are automatically executed.
3. Once your PR is merged, the code you have written is applied the same lisence as the other part of SlackStream (MIT lisence).
