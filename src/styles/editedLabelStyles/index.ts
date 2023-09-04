import {TextStyle} from 'react-native';
import display from '../utilities/display';
import flex from '../utilities/flex';
import EditedLabelStyles from './types';

const editedLabelStyles: EditedLabelStyles = {
    ...(display.dInlineFlex as TextStyle),
    ...flex.alignItemsBaseline,
};

export default editedLabelStyles;
