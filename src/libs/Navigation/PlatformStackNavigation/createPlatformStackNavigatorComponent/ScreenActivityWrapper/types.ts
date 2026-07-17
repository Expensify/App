import type {ReactNode} from 'react';

type ScreenActivityWrapperProps = {
    /** Whether the screen is not currently visible to the user */
    isScreenBlurred: boolean;

    /** Key identifying this screen instance */
    routeKey: string;

    /** Name of the screen whose Activity state is being tracked */
    routeName: string;

    /** The screen content to deprioritize when blurred */
    children: ReactNode;
};

export default ScreenActivityWrapperProps;
