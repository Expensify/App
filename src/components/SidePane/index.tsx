import {Portal} from '@gorhom/portal';
import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';
import Modal from '@components/Modal';
import ModalContext from '@components/Modal/ModalContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePane from '@hooks/useSidePane';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import Help from './Help';
import SidePaneOverlay from './SidePaneOverlay';

function SidePane() {
    const {shouldHideSidePane, sidePaneTranslateX, shouldHideSidePaneBackdrop, isPaneHidden, closeSidePane} = useSidePane();
    const {activeModalType} = useContext(ModalContext);
    const isInNarrowPaneModal = useRootNavigationState((state) => activeModalType === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED || state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const {isExtraLargeScreenWidth} = useResponsiveLayout();

    console.log(`%%% shouldHideSidePane`, shouldHideSidePane);

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <ModalPortal>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <Text style={{color: 'white'}}>TESTESTTEST</Text>
            <View>
                {!shouldHideSidePaneBackdrop && (
                    <SidePaneOverlay
                        onBackdropPress={closeSidePane}
                        isInNarrowPaneModal={isInNarrowPaneModal}
                    />
                )}
            </View>
            <Help
                sidePaneTranslateX={sidePaneTranslateX}
                closeSidePane={closeSidePane}
            />
        </ModalPortal>
    );

    return (
        <>
            <View>
                {!shouldHideSidePaneBackdrop && (
                    <SidePaneOverlay
                        onBackdropPress={closeSidePane}
                        isInNarrowPaneModal={isInNarrowPaneModal}
                    />
                )}
            </View>
            <Modal
                type="sidePane"
                onClose={closeSidePane}
                isVisible={!isPaneHidden}
                propagateSwipe={false}
                navigationHistoryID="sidePane"
                fullscreen={!isExtraLargeScreenWidth}
            >
                <Help
                    sidePaneTranslateX={sidePaneTranslateX}
                    closeSidePane={closeSidePane}
                />
            </Modal>
        </>
    );

    return (
        <>
            <View>
                {!shouldHideSidePaneBackdrop && (
                    <SidePaneOverlay
                        onBackdropPress={closeSidePane}
                        isInNarrowPaneModal={isInNarrowPaneModal}
                    />
                )}
            </View>
            <Help
                sidePaneTranslateX={sidePaneTranslateX}
                closeSidePane={closeSidePane}
            />
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
