import {isMobile} from '@libs/Browser';

function isInLandscapeMode(): boolean;
function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean;
function isInLandscapeMode(windowWidth?: number, windowHeight?: number): boolean {
    if (!isMobile()) {
        return false;
    }

    if (windowWidth !== undefined && windowHeight !== undefined) {
        return windowWidth > windowHeight;
    }

    const orientationType = window.screen?.orientation?.type;
    if (orientationType) {
        return orientationType.startsWith('landscape');
    }

    return window.innerWidth > window.innerHeight;
}

export default isInLandscapeMode;
