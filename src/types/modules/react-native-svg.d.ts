import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {CommonPathProps as BaseCommonPathProps, SvgProps as BaseSvgProps} from 'react-native-svg';

declare module 'react-native-svg' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SvgProps extends BaseSvgProps {
        xmlns?: string;
        xmlnsXlink?: string;
        xmlSpace?: string;
        hovered?: string;
        pressed?: string;

        // react-native-svg's web entry exports no prop types, so on web `SvgProps` only has what is declared here.
        // These are the props the App passes to <Svg>.
        width?: number | string;
        height?: number | string;
        fill?: ColorValue;
        style?: StyleProp<ViewStyle>;
        testID?: string;
        preserveAspectRatio?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- `aria-hidden` is the ARIA attribute name and can't be camelCased
        'aria-hidden'?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CommonPathProps extends BaseCommonPathProps {
        className?: string;
    }
}
