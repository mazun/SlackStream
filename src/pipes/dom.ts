import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {
    }

    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}

@Pipe({ name: 'safeURL' })
export class SafeURLPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {
    }

    transform(value) {
        return this.sanitized.bypassSecurityTrustUrl(value);
    }
}
