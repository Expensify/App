import type {GetReportPaddingBottom} from './types';

const getReportPaddingBottom: GetReportPaddingBottom = ({safePaddingBottom, isKeyboardActive, composerHeight, isComposerFullSize}) => {
    const safeAreaBottom = isKeyboardActive ? 0 : safePaddingBottom;
    return isComposerFullSize ? safeAreaBottom : composerHeight + safeAreaBottom;
};

export default getReportPaddingBottom;
