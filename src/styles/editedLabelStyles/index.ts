import EditedLabelStyles from './types';
import display from '../utilities/display';
import flex from '../utilities/flex';

const editedLabelStyles: EditedLabelStyles = {...display.dInlineFlex, ...flex.alignItemsBaseline};

export default editedLabelStyles;
