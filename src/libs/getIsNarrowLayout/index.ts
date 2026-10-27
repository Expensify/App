import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import isInLandscapeMode from '@libs/isInLandscapeMode';

export default function getIsNarrowLayout() {
    return getIsSmallScreenWidth() || isInLandscapeMode();
}
