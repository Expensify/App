import {createNavigationContainerRef} from '@react-navigation/native';
import type {NavigationRef} from './types';

const navigationRef: NavigationRef = createNavigationContainerRef();

/*
 * Returns the root navigation state if the navigation is ready, otherwise returns null.
 */
const getRootState = () => {
    if (!navigationRef.isReady()) {
        return null;
    }
    return navigationRef.getRootState();
};

export default navigationRef;
export {getRootState};
