import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import ONYXKEYS from '../ONYXKEYS';
import Modal from './Modal';
import CONST from '../CONST';
import * as App from '../libs/actions/App';
import TestToolMenu from './TestToolMenu';
import styles from '../styles/styles';

const propTypes = {
    /** Whether the test tools modal is open */
    isTestToolsModalOpen: PropTypes.bool,
};

const defaultProps = {
    isTestToolsModalOpen: false,
};

const TestToolsModal = props => (
    <Modal
        isVisible={props.isTestToolsModalOpen}
        type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
        onClose={App.closeTestToolModal}
    >
        <View style={[styles.settingsPageBody, styles.p5]}>
            <TestToolMenu />
        </View>
    </Modal>
);

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
