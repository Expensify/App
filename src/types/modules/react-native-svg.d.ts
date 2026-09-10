import type {StyleProp, ViewStyle} from 'react-native';
import type {CommonPathProps as BaseCommonPathProps, SvgProps as BaseSvgProps} from 'react-native-svg';

declare module 'react-native-svg' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SvgProps extends BaseSvgProps {
        xmlns?: string;
        xmlnsXlink?: string;
        xmlSpace?: string;
        hovered?: string;
        pressed?: string;
        width?: number | string;
        height?: number | string;
        fill?: string;
        style?: StyleProp<ViewStyle>;
        testID?: string;
        pointerEvents?: string;
        preserveAspectRatio?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-hidden'?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CommonPathProps extends BaseCommonPathProps {
        className?: string;
    }
}
