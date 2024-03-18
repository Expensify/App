import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useEnvironment from '@hooks/useEnvironment';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Modal from './Modal';
import ProfilingToolMenu from './ProfilingToolMenu';
import TestToolMenu from './TestToolMenu';

type TestToolsModalOnyxProps = {
    /** Whether the test tools modal is open */
    isTestToolsModalOpen: OnyxEntry<boolean>;
};

type TestToolsModalProps = TestToolsModalOnyxProps;

function TestToolsModal({isTestToolsModalOpen = false}: TestToolsModalProps) {
    const {isDevelopment} = useEnvironment();
    const {windowWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    return (
        <Modal
            isVisible={!!isTestToolsModalOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={toggleTestToolsModal}
        >
            <View style={[StyleUtils.getTestToolsModalStyle(windowWidth)]}>
                {isDevelopment && <TestToolMenu />}
                <ProfilingToolMenu />
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
