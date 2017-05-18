import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';

import { shell } from 'electron';
import * as $ from 'jquery';

require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap/dist/css/bootstrap-theme.min.css');
require('emojione/extras/css/emojione.min.css');
require('./assets/css/styles.css');

if (process.env.ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

$(document).on('click', 'a[href^="http"]', function(event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

document.ondragover = document.ondrop = function(e) {
  e.preventDefault();
  return false;
};
