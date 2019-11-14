import { Directive, Input, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';

@Directive({
  selector: "[appAutofocus]"
})
export class AutofocusDirective {
  @Input() public autoFocus: boolean;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private changes: ChangeDetectorRef
  ) {}

  public ngAfterContentInit() {
      setTimeout(() => {
      this.el.nativeElement.focus();
    }, 500);
  }
}
