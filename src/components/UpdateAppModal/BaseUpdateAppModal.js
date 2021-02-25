import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity, Text,
} from 'react-native';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Modal from '../Modal';
import styles from '../../styles/styles';

const propTypes = {
    // Callback to fire when we want to trigger the update.
    onSubmit: PropTypes.func,

    // Version string for the app to update to.
    // eslint-disable-next-line react/no-unused-prop-types
    version: PropTypes.string,
};

const defaultProps = {
    onSubmit: null,
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
     * Execute the onSubmit callback and close the modal.
     */
    submitAndClose() {
        this.props.onSubmit(this.state.file);
        this.setState({isModalOpen: false});
    }

    render() {
        return (
            <>
                <Modal
                    onSubmit={this.submitAndClose}
                    onClose={() => this.setState({isModalOpen: false})}
                    isVisible={this.state.isModalOpen}
                >
                    <HeaderWithCloseButton
                        title="Update App"
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                    />
                    <Text style={[styles.textLabel, styles.p4]}>
                        A new version of Expensify.cash is available.
                        Update now or restart the app at a later time to download the latest changes.
                    </Text>
                    {this.props.onSubmit && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSuccess, styles.buttonConfirm]}
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
