import {Dimensions} from 'react-native';
import variables from '../../../styles/variables';

// On mobile web the default "back behavior" is going to be opening the drawer again so we'll change this behavior
// depending on what size screen we are dealing with
const screenWidth = Dimensions.get('window').width;
export default () => screenWidth > variables.mobileResponsiveWidthBreakpoint;
