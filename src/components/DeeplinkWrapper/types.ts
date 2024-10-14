import type ChildrenProps from '@src/types/utils/ChildrenProps';

type DeeplinkWrapperProps = ChildrenProps & {
    /** User authentication status */
    isAuthenticated: boolean;

    /** The auto authentication status */
    autoAuthState?: string;

    initialUrl?: string;
};

export default DeeplinkWrapperProps;
