import ChildrenProps from '@src/types/utils/ChildrenProps';

type CollapsibleProps = ChildrenProps & {
    /** Whether the section should start expanded. False by default */
    isOpened?: boolean;
};

export default CollapsibleProps;
