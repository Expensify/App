import React from 'react';
import {sidebarPropTypes, sidebarDefaultProps} from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import PopoverModal from './PopoverModal';

const SidebarScreen = (props) => {
    let popoverModal = null;

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        document.addEventListener('dragover', popoverModal.hideCreateMenu);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        document.removeEventListener('dragover', popoverModal.hideCreateMenu);
    };

    return (
        <>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
            <PopoverModal
                ref={el => popoverModal = el}
                onShowCreateMenu={createDragoverListener}
                onHideCreateMenu={removeDragoverListener}
            />
        </>
    );
};

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.defaultProps = sidebarDefaultProps;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
