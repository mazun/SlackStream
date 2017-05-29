import { Directive, ElementRef, Renderer, Input } from '@angular/core';

@Directive({
    selector: '[autofocus]'
})
export class AutofocusDirective {
    private _autofocus;
    constructor(private el: ElementRef, private renderer: Renderer) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        if (this._autofocus || typeof this._autofocus === 'undefined') {
            this.renderer.invokeElementMethod(this.el.nativeElement, 'focus', []);
        }
    }

    @Input() set autofocus(condition: boolean) {
        this._autofocus = condition !== false;
    }
}
