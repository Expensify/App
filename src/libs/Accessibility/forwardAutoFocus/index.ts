// Web: the browser handles window-state focus on its own. iOS: VoiceOver auto-focuses on screen-stack push without intervention. Both are no-ops here.
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

function notifyBackButtonMounted(_view: View | RNText | null): void {}
function scheduleForwardAutoFocus(): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */

export {notifyBackButtonMounted, scheduleForwardAutoFocus};
