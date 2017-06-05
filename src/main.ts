import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { shell, ipcRenderer } from 'electron';
import { setSettingPath } from './services/setting.service';
import * as $ from 'jquery';
import * as path from 'path';

require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap/dist/css/bootstrap-theme.min.css');
require('emojione/assets/css/emojione.min.css');
require('emojione/assets/css/emojione-awesome.css');
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

    if (process.env.ENV !== 'development') {
        enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule);
});

ipcRenderer.send('ready', '');
