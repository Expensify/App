import React, {useRef} from 'react';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import FreezeWrapper from '../../../../libs/Navigation/FreezeWrapper';
import withWindowDimensions from '../../../../components/withWindowDimensions';

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
        <FreezeWrapper keepVisible={!props.isSmallScreenWidth}>
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
        </FreezeWrapper>
    );
};

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default withWindowDimensions(SidebarScreen);
