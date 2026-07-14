import type GetPillVisibilityOffsetYParams from './types';

function getPillVisibilityOffsetY({offsetY, kHeight}: GetPillVisibilityOffsetYParams) {
    return kHeight + offsetY;
}

export default getPillVisibilityOffsetY;
