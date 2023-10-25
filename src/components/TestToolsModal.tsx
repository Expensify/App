import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import ONYXKEYS from '../ONYXKEYS';
import Modal from './Modal';
import CONST from '../CONST';
import toggleTestToolsModal from '../libs/actions/TestTool';
import TestToolMenu from './TestToolMenu';
import styles from '../styles/styles';

type TestToolsModalOnyxProps = {
    /** Whether the test tools modal is open */
    isTestToolsModalOpen: OnyxEntry<boolean>;
};

type TestToolsModalProps = TestToolsModalOnyxProps;

function TestToolsModal({isTestToolsModalOpen = false}: TestToolsModalProps) {
    return (
        <Modal
            isVisible={isTestToolsModalOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={toggleTestToolsModal}
        >
            <View style={[styles.settingsPageBody, styles.p5]}>
                <TestToolMenu />
            </View>
        </Modal>
    );
}

TestToolsModal.displayName = 'TestToolsModal';

export default withOnyx<TestToolsModalProps, TestToolsModalOnyxProps>({
    isTestToolsModalOpen: {
        key: ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    },
})(TestToolsModal);
