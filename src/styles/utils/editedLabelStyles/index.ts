// eslint-disable-next-line no-restricted-imports
import display from '@styles/utils/display';
// eslint-disable-next-line no-restricted-imports
import flex from '@styles/utils/flex';
// eslint-disable-next-line no-restricted-imports
import userSelect from '@styles/utils/userSelect';
import type EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...display.dInlineFlex,
    ...flex.alignItemsBaseline,
    ...userSelect.userSelectNone,
};

export default editedLabelStyles;
