import type ChildrenProps from '@src/types/utils/ChildrenProps';

/** The web app root never pads the horizontal safe area, so screens don't either. */
function HorizontalSafeArea({children}: ChildrenProps) {
    return children;
}

export default HorizontalSafeArea;
