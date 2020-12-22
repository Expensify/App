import {Dimensions} from 'react-native';
import variables from '../../../styles/variables';
import SignInPageLayoutNarrow from './SignInPageLayoutNarrow';
import SignInPageLayoutWide from './SignInPageLayoutWide';

const windowSize = Dimensions.get('window');

// Use the proper layout depending on the window width
const moduleToExport = (windowSize.width <= variables.mobileResponsiveWidthBreakpoint)
    ? SignInPageLayoutNarrow
    : SignInPageLayoutWide;

export default moduleToExport;
