import {circularDeepEqual} from 'fast-equals';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import Modal from './Modal';
import type {PopoverWithMeasuredContentProps} from './PopoverWithMeasuredBase';
import PopoverWithMeasuredContentBase from './PopoverWithMeasuredBase';

function PopoverWithMeasuredContent({...props}: PopoverWithMeasuredContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    if (!shouldUseNarrowLayout) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <PopoverWithMeasuredContentBase {...props} />;
    }
    return (
        <Modal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
        />
    );
}
PopoverWithMeasuredContent.displayName = 'PopoverWithMeasuredContent';

export default React.memo(PopoverWithMeasuredContent, (prevProps, nextProps) => {
    if (prevProps.isVisible === nextProps.isVisible && nextProps.isVisible === false) {
        return true;
    }
    return circularDeepEqual(prevProps, nextProps);
});

export type {PopoverWithMeasuredContentProps};
