import React, {useRef} from 'react';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';

const SidebarScreen = (props) => {
    const popoverModal = useRef(null);

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        document.addEventListener('dragover', popoverModal.current.hideCreateMenu);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        document.removeEventListener('dragover', popoverModal.current.hideCreateMenu);
    };

    return (
        <BaseSidebarScreen
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <FloatingActionButtonAndPopover
                ref={popoverModal}
                onShowCreateMenu={createDragoverListener}
                onHideCreateMenu={removeDragoverListener}
            />
        </BaseSidebarScreen>
    );
};

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
