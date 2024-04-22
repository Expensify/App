import React from 'react';
import {View} from 'react-native';
import CONST from "@src/CONST";
import Modal from "@components/Modal";
import useWindowDimensions from "@hooks/useWindowDimensions";
import useStyleUtils from "@hooks/useStyleUtils";
import ConsoleComponents from "./ConsoleComponents";

type ConsoleModalProps = {
    /** Locally created file */
    isVisible: boolean
    /** Action to run when pressing Share button */
    onClose: () => void;
    /** Action to close the test tools modal */
    closeTestToolsModal?: () => void;
};


function ConsoleModal({isVisible, onClose, closeTestToolsModal}: ConsoleModalProps) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL_AND_UNSWIPEABLE}
            onClose={onClose}
        >
            <View style={[StyleUtils.getTestToolsModalStyle(windowWidth), {height: (windowHeight * 0.9)}]}>

                <ConsoleComponents onClose={() => {
                    onClose()
                    if (closeTestToolsModal) {
                        closeTestToolsModal()
                    }
                }} isViaTestToolsModal/>
            </View>
        </Modal>
    );
}

ConsoleModal.displayName = 'ConsoleModal';

export default ConsoleModal;
