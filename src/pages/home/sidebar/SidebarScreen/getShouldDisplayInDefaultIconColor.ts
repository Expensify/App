import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

/**
 *
 * @returns boolean true for native platforms (Android & iOS)
 */
function getShouldDisplayInDefaultIconColor(): boolean {
    const platform = getPlatform();
    return platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;
}

export default getShouldDisplayInDefaultIconColor;
