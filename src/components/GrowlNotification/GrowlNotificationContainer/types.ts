import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {SharedValue} from 'react-native-reanimated';

type GrowlNotificationContainerProps = ChildrenProps & {
    translateY: SharedValue<number>;
};

export default GrowlNotificationContainerProps;
