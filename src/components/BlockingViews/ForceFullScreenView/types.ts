import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ForceFullScreenViewProps = ChildrenProps & {
    shouldForceFullScreen?: boolean;
    testID?: string;
};

export default ForceFullScreenViewProps;
