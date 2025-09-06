import type GetReportPaddingBottomParams from './types';

const getReportPaddingBottom = ({safePaddingBottom, isKeyboardActive, composerHeight, isComposerFullSize}: GetReportPaddingBottomParams) => {
    const safeAreaBottom = isKeyboardActive ? 0 : safePaddingBottom;
    return !isComposerFullSize ? composerHeight + safeAreaBottom : safeAreaBottom;
};

export default getReportPaddingBottom;
