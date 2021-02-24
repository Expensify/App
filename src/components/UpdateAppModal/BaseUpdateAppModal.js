import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity, Text,
} from 'react-native';
import CONST from '../../CONST';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Modal from '../Modal';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    // Optional callback to fire when we want to trigger the update.
    onConfirm: PropTypes.func,

    // Version string for the app to update to.
    // eslint-disable-next-line react/no-unused-prop-types
    version: PropTypes.string,
};

const defaultProps = {
    onConfirm: null,
    version: '',
};

class BaseUpdateAppModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: true,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
    }

    /**
     * Execute the onConfirm callback and close the modal.
     */
    submitAndClose() {
        this.props.onConfirm(this.state.file);
        this.setState({isModalOpen: false});
    }

    render() {
        return (
            <>
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                    onSubmit={this.submitAndClose}
                    onClose={() => this.setState({isModalOpen: false})}
                    isVisible={this.state.isModalOpen}
                    backgroundColor={themeColors.componentBG}
                >
                    <HeaderWithCloseButton
                        title="Update App"
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                    />
                    <Text style={[styles.textLabel, styles.p4]}>
                        A new version of Expensify.cash is available.
                        Update now or restart the app at a later time to download the latest changes.
                    </Text>
                    {/* If we have an onConfirm method show a confirmation button */}
                    {this.props.onConfirm && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSuccess, styles.buttonConfirm]}
                            underlayColor={themeColors.componentBG}
                            onPress={this.submitAndClose}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    styles.buttonSuccessText,
                                    styles.buttonConfirmText,
                                ]}
                            >
                                Update App
                            </Text>
                        </TouchableOpacity>
                    )}
                </Modal>
            </>
        );
    }
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;
export default BaseUpdateAppModal;
