import {Keyboard} from 'react-native';

export default function waitForKeyboard(): Promise<void> {
    return new Promise((resolve) => {
        function checkKeyboard() {
            if (Keyboard.isVisible()) {
                resolve();
            } else {
                console.debug('[E2E] Waiting for keyboard to appear…');
                setTimeout(checkKeyboard, 1000);
            }
        }
        checkKeyboard();
    });
}
