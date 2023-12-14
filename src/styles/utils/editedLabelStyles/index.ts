// eslint-disable-next-line no-restricted-imports
import display from '@styles/utils/display';
// eslint-disable-next-line no-restricted-imports
import flex from '@styles/utils/flex';
import EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...display.dInlineFlex,
    ...flex.alignItemsBaseline,
};

export default editedLabelStyles;
