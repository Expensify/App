/**
 * On Android we setup the status bar in native code.
 */
import type CustomStatusBarType from './types';

// eslint-disable-next-line react/function-component-definition
const CustomStatusBar: CustomStatusBarType = () =>
    // Prefer to not render the StatusBar component in Android as it can cause
    // issues with edge to edge display. We setup the status bar appearance in
    // MainActivity.java and styles.xml.
    null;

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;
