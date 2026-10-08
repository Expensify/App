import type {SwipeableRowAction} from '@components/SwipeableRow/types';

import type {AccessibilityProps} from 'react-native';

type SwipeableRowAccessibilityProps = Pick<AccessibilityProps, 'accessibilityActions' | 'onAccessibilityAction'>;

type GetSwipeableRowAccessibilityProps = (actions: SwipeableRowAction[]) => SwipeableRowAccessibilityProps;

export default GetSwipeableRowAccessibilityProps;
