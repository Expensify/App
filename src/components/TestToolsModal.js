import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import useThemeStyles from '@styles/useThemeStyles';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Modal from './Modal';
import TestToolMenu from './TestToolMenu';

const propTypes = {
    /** Details about modal */
    modal: PropTypes.shape({
        /** Indicates when an Alert modal is about to be visible */
        willAlertModalBecomeVisible: PropTypes.bool,
    }),

    /** Whether the test tools modal is open */
    isTestToolsModalOpen: PropTypes.bool,
};

const defaultProps = {
    modal: {},
    isTestToolsModalOpen: false,
};

function TestToolsModal(props) {
    const styles = useThemeStyles();
    return (
        <Modal
            isVisible={props.isTestToolsModalOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={toggleTestToolsModal}
        >
            <View style={[styles.settingsPageBody, styles.p5]}>
                <TestToolMenu />
            </View>
        </Modal>
    );
}

TestToolsModal.propTypes = propTypes;
TestToolsModal.defaultProps = defaultProps;
TestToolsModal.displayName = 'TestToolsModal';

export default withOnyx({
    modal: {
        key: ONYXKEYS.MODAL,
    },
    isTestToolsModalOpen: {
        key: ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    },
})(TestToolsModal);
