import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Runs demo code
 */
function runDemo() {
    // No demo is being run, so clear out demo info
    Onyx.set(ONYXKEYS.DEMO_INFO, {});
}

export default runDemo;
