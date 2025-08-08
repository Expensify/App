import {circularDeepEqual} from 'fast-equals';
import React from 'react';
import Modal from '@components/Modal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import PopoverWithMeasuredContentBase from './PopoverWithMeasuredContentBase';
import type PopoverWithMeasuredContentProps from './types';

/**
 * Logic for PopoverWithMeasuredContent is in PopoverWithMeasuredContentBase.
 * This component is a perf optimization, it return BOTTOM_DOCKED early, for small screens avoiding Popover measurement logic calculations.
 */
function PopoverWithMeasuredContent({...props}: PopoverWithMeasuredContentProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    if (isSmallScreenWidth) {
        return (
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                animationIn="slideInUp"
                animationOut="slideOutDown"
            />
        );
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <PopoverWithMeasuredContentBase {...props} />;
}
PopoverWithMeasuredContent.displayName = 'PopoverWithMeasuredContent';

export default React.memo(PopoverWithMeasuredContent, (prevProps, nextProps) => {
    if (prevProps.isVisible === nextProps.isVisible && nextProps.isVisible === false) {
        return true;
    }
    return circularDeepEqual(prevProps, nextProps);
});
