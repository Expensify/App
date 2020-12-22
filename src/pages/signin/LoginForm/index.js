import {Dimensions} from 'react-native';
import variables from '../../../styles/variables';
import LoginFormNarrow from './LoginFormNarrow';
import LoginFormWide from './LoginFormWide';

const windowSize = Dimensions.get('window');

// Use the proper layout depending on the window width
const moduleToExport = (windowSize.width <= variables.mobileResponsiveWidthBreakpoint)
    ? LoginFormNarrow
    : LoginFormWide;

export default moduleToExport;
