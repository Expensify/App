import React, {useRef, useCallback} from 'react';
import {InteractionManager} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import FreezeWrapper from '../../../../libs/Navigation/FreezeWrapper';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import StatusBar from '../../../../libs/StatusBar';
import themeColors from '../../../../styles/themes/default';

function SidebarScreen(props) {
    const popoverModal = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const previousColor = StatusBar.getBackgroundColor();
            InteractionManager.runAfterInteractions(() => StatusBar.setBackgroundColor(themeColors.sidebar));

            return () => {
                InteractionManager.runAfterInteractions(() => StatusBar.setBackgroundColor(previousColor));
            };
        }, []),
    );

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
}

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default withWindowDimensions(SidebarScreen);
