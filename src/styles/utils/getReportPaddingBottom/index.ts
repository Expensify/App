import type GetReportPaddingBottomParams from './types';

const getReportPaddingBottom = ({safePaddingBottom, isKeyboardActive}: GetReportPaddingBottomParams) => (isKeyboardActive ? 0 : safePaddingBottom);

export default getReportPaddingBottom;
