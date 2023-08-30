// eslint-disable-next-line no-restricted-imports
import {StatusBar} from 'react-native';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// We override this because it's not used – on Android our app display edge-to-edge.
// Also because Reanimated's interpolateColor gives Android native colors instead of hex strings, causing this to display a warning.
StatusBar.setBackgroundColor = () => null;

// Just export StatusBar – no changes.
export default StatusBar;
