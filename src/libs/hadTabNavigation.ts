/**
 * True when the user is keyboard-navigating the UI, false when typing into a
 * form field or using a mouse. Typing keys clear; navigational / named keys
 * preserve.
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
            return;
        }
        // Modifier-key shortcuts (Cmd/Ctrl/Alt + key) are navigation, not typing — preserve modality.
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }
        // Printable chars (not space) + Backspace/Delete clear; everything else preserves.
        const isTypingKey = (e.key.length === 1 && e.key !== ' ') || e.key === 'Backspace' || e.key === 'Delete';
        if (isTypingKey) {
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
