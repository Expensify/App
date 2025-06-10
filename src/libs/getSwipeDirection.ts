import {Platform} from 'react-native';
import type {Direction} from 'react-native-modal';

/**
 * Returns the swipeDirection only for iOS, otherwise undefined.
 */
export default function getSwipeDirection(swipeDirection: Direction | undefined) {
    return Platform.OS === 'ios' ? swipeDirection : undefined;
}
