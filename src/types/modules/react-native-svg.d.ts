import {CommonPathProps as BaseCommonPathProps, SvgProps as BaseSvgProps} from 'react-native-svg';

declare module 'react-native-svg' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SvgProps extends BaseSvgProps {
        xmlns?: string;
        xmlnsXlink?: string;
        xmlSpace?: string;
        hovered?: string;
        pressed?: string;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CommonPathProps extends BaseCommonPathProps {
        className?: string;
    }
}
