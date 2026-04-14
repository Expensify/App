/**
 * True when the user is Tab-navigating the UI, false when typing into a form
 * field or using a mouse. Enter/Space preserve the current value (activation
 * keys aren't typing).
 */
let hadTabNavigation = false;
let teardown: (() => void) | null = null;

function setup(): void {
    if (teardown || typeof document === 'undefined') {
        return;
    }

    const keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            hadTabNavigation = true;
        } else if (e.key !== 'Enter' && e.key !== ' ') {
            hadTabNavigation = false;
        }
    };
    const mousedownHandler = () => {
        hadTabNavigation = false;
    };

    document.addEventListener('keydown', keydownHandler, true);
    document.addEventListener('mousedown', mousedownHandler, true);

    teardown = () => {
        document.removeEventListener('keydown', keydownHandler, true);
        document.removeEventListener('mousedown', mousedownHandler, true);
        teardown = null;
    };
}

function teardownHadTabNavigation(): void {
    teardown?.();
}

function getHadTabNavigation(): boolean {
    return hadTabNavigation;
}

setup();

export default getHadTabNavigation;
export {teardownHadTabNavigation};
