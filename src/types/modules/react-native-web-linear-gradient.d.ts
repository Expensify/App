/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'react-native-web-linear-gradient' {
    import type {ViewProps} from 'react-native';

    interface LinearGradientProps extends ViewProps {
        colors: string[];
        start?: {x: number; y: number};
        end?: {x: number; y: number};
        locations?: number[];
        useAngle?: boolean;
        angle?: number;
    }

    class LinearGradient extends React.PureComponent<LinearGradientProps> {}

    export default LinearGradient;
}
