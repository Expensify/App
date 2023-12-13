import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Modal from './Modal';
import TestToolMenu from './TestToolMenu';

type TestToolsModalOnyxProps = {
    /** Whether the test tools modal is open */
    isTestToolsModalOpen: OnyxEntry<boolean>;
};

type TestToolsModalProps = TestToolsModalOnyxProps;

function TestToolsModal({isTestToolsModalOpen = false}: TestToolsModalProps) {
    const styles = useThemeStyles();

    return (
        <Modal
            isVisible={!!isTestToolsModalOpen}
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
