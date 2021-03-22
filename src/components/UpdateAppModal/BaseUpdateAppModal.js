import React, {PureComponent} from 'react';
import {
    TouchableOpacity, Text, View,
} from 'react-native';
import Header from '../Header';
import Modal from '../Modal';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './UpdateAppModalPropTypes';
import CONST from '../../CONST';
import withWindowDimensions from '../withWindowDimensions';

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
                    type={this.props.isSmallScreenWidth
                        ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                >
                    <View style={[styles.m5]}>
                        <View style={[styles.flexRow]}>
                            <Header title="Update App" />
                        </View>
                        <Text style={[styles.textLabel, styles.mt4]}>
                            A new version of Expensify.cash is available.
                            Update now or restart the app at a later time to download the latest changes.
                        </Text>
                        {this.props.onSubmit && (
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.mt4]}
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
                        <TouchableOpacity
                            style={[styles.button, styles.mt3]}
                            onPress={() => this.setState({isModalOpen: false})}
                        >
                            <Text style={[styles.buttonText]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </>
        );
    }
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;
export default withWindowDimensions(BaseUpdateAppModal);
