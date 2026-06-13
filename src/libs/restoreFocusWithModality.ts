import getHadTabNavigation from './hadTabNavigation';

/** Restores focus with the keyboard ring matched to the current input modality: visible for keyboard (WCAG 2.4.7), suppressed for touch. */
function restoreFocusWithModality(el: HTMLElement): void {
    el.focus({preventScroll: true, focusVisible: getHadTabNavigation()});
}

export default restoreFocusWithModality;
