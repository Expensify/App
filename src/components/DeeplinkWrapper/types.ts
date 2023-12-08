import ChildrenProps from '@src/types/utils/ChildrenProps';

type DeeplinkWrapperProps = ChildrenProps & {
    /** User authentication status */
    isAuthenticated: boolean;
};

export default DeeplinkWrapperProps;
