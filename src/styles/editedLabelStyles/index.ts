import display from '@styles/utilities/display';
import flex from '@styles/utilities/flex';
import EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...display.dInlineFlex,
    ...flex.alignItemsBaseline,
};

export default editedLabelStyles;
