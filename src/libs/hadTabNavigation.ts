/** True when the user is keyboard-navigating; false when typing or using a mouse. Typing/printable keys clear; Tab/Arrow/named keys preserve. */
let hadTabNavigation = false;
let teardown: (() => void) | null = null;

function setup(): void {
    if (teardown || typeof document === 'undefined') {
        return;
    }

    const keydownHandler = (e: KeyboardEvent) => {
        // Autofill/password-manager synthetic events can omit `key` — guard before .length access.
        if (typeof e.key !== 'string') {
            return;
        }
        if (e.key === 'Tab') {
            hadTabNavigation = true;
            return;
        }
        // Modifier-key shortcuts (Cmd/Ctrl/Alt + key) preserve modality. Exclude AltGraph (ctrl+alt on Windows/Linux) which produces printable chars on international layouts.
        const isAltGraph = typeof e.getModifierState === 'function' && e.getModifierState('AltGraph');
        if (!isAltGraph && (e.ctrlKey || e.metaKey || e.altKey)) {
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

function resetForTests(): void {
    hadTabNavigation = false;
}

setup();

export default getHadTabNavigation;
export {teardownHadTabNavigation, resetForTests};
