import getOperatingSystem from '@libs/getOperatingSystem';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type GetContextMenuAccessibilityHintParams = {
    translate: (key: TranslationPaths) => string;
};

function getContextMenuAccessibilityHint({translate}: GetContextMenuAccessibilityHintParams) {
    const platform = getPlatform(true);

    if (platform === CONST.PLATFORM.WEB) {
        if (getOperatingSystem() === CONST.OS.MAC_OS) {
            return translate('accessibilityHints.contextMenuAvailable').replace('Shift+F10', 'Control-click');
        }
        return translate('accessibilityHints.contextMenuAvailable');
    }

    return translate('accessibilityHints.contextMenuAvailableNative');
}

export default getContextMenuAccessibilityHint;
