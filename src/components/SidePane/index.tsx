import React, {useContext} from 'react';
import {View} from 'react-native';
import Modal from '@components/Modal';
import ModalContext from '@components/Modal/ModalContext';
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

    if (shouldHideSidePane) {
        return null;
    }

    console.log(`%%% activeModalType`, activeModalType);

    // return (
    //     <>
    //         <View>
    //             {!shouldHideSidePaneBackdrop && (
    //                 <SidePaneOverlay
    //                     onBackdropPress={closeSidePane}
    //                     isInNarrowPaneModal={isInNarrowPaneModal}
    //                 />
    //             )}
    //         </View>
    //         <Modal
    //             type="right_docked"
    //             onClose={closeSidePane}
    //             isVisible={!isPaneHidden}
    //             propagateSwipe={false}
    //             navigationHistoryID="sidePane"
    //         >
    //             <Help
    //                 sidePaneTranslateX={sidePaneTranslateX}
    //                 closeSidePane={closeSidePane}
    //             />
    //         </Modal>
    //     </>
    // );

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
