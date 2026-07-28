import type {ReactNode} from 'react';

type ScreenFreezeWrapperProps = {
    /** Whether the screen is not currently visible to the user */
    isScreenBlurred: boolean;

    /** The screen content to freeze when blurred */
    children: ReactNode;
};

export default ScreenFreezeWrapperProps;
