import display from '@styles/utils/display';
import flex from '@styles/utils/flex';
import EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...display.dInlineFlex,
    ...flex.alignItemsBaseline,
};

export default editedLabelStyles;
