import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

type NavigationTabBarSurfaceProps = {
    /** Tab items drawn on top of the surface. */
    children: ReactNode;

    /** Capsule geometry the surface has to take: size, radius and inner padding. */
    style: StyleProp<ViewStyle>;

    testID?: string;
};

export default NavigationTabBarSurfaceProps;
