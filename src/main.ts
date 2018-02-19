import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { shell, ipcRenderer } from 'electron';
import { setSettingPath } from './services/setting.service';
import { setUsedFrequencyPath } from './services/slack/emoji.service';
import * as $ from 'jquery';
import * as path from 'path';

require('bootstrap/dist/css/bootstrap.min.css');
require('emojione/extras/css/emojione.min.css');
require('emojione/extras/css/emojione-awesome.css');
require('select2/dist/css/select2.min.css');
require('./assets/css/styles.css');

$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

document.ondragover = document.ondrop = function (e) {
    e.preventDefault();
    return false;
};

ipcRenderer.on('userData', (event, arg) => {
    const userData = arg;
    setSettingPath(path.join(userData, 'setting.json'));
    setUsedFrequencyPath(userData);

    if (process.env.ENV !== 'development') {
        enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule);
});

ipcRenderer.send('ready', '');
