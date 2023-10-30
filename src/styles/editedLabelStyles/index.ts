import display from '../utilities/display';
import flex from '../utilities/flex';
import EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...display.dInlineFlex,
    ...flex.alignItemsBaseline,
};

export default editedLabelStyles;
