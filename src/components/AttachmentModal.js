import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity, Text, Dimensions,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ModalWithHeader from './ModalWithHeader';
import AttachmentView from './AttachmentView';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import ONYXKEYS from '../ONYXKEYS';
import addAuthTokenToURL from '../libs/addAuthTokenToURL';
import downloadUrlFile from '../libs/downloadUrlFile';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    // Title of the modal header
    title: PropTypes.string,

    // Optional source URL for the image shown inside the .
    // If not passed in via props must be specified when modal is opened.
    sourceURL: PropTypes.string,

    // Optional callback to fire when we want to preview an image and approve it for use.
    onConfirm: PropTypes.func,

    // A function as a child to pass modal launching methods to
    children: PropTypes.func.isRequired,

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool,

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    title: '',
    sourceURL: null,
    onConfirm: null,
    isAuthTokenRequired: false,
};

class AttachmentModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            file: null,
            sourceURL: props.sourceURL,
        };
    }

    render() {
        const sourceURL = addAuthTokenToURL({
            url: this.state.sourceURL,
            authToken: this.props.session.authToken,
            required: this.props.isAuthTokenRequired,
        });

        const isSmallScreen = Dimensions.get('window').width < variables.mobileResponsiveWidthBreakpoint;
        const attachmentViewStyles = isSmallScreen
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];
        return (
            <>
                <ModalWithHeader
                    type={CONST.MODAL.MODAL_TYPE.CENTERED}
                    onClose={() => this.setState({isModalOpen: false})}
                    onDownload={() => downloadUrlFile(sourceURL)}
                    isVisible={this.state.isModalOpen}
                    title={this.props.title}
                    backgroundColor={themeColors.componentBG}
                >
                    <View style={attachmentViewStyles}>
                        {this.state.sourceURL && (
                            <AttachmentView sourceURL={sourceURL} file={this.state.file} />
                        )}
                    </View>

                    {/* If we have an onConfirm method show a confirmation button */}
                    {this.props.onConfirm && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSuccess, styles.buttonConfirm]}
                            underlayColor={themeColors.componentBG}
                            onPress={() => {
                                this.props.onConfirm(this.state.file);
                                this.setState({isModalOpen: false});
                            }}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    styles.buttonSuccessText,
                                    styles.buttonConfirmText,
                                ]}
                            >
                                Upload
                            </Text>
                        </TouchableOpacity>
                    )}
                </ModalWithHeader>
                {this.props.children({
                    displayFileInModal: ({file}) => {
                        if (file instanceof File) {
                            const source = URL.createObjectURL(file);
                            this.setState({isModalOpen: true, sourceURL: source, file});
                        } else {
                            this.setState({isModalOpen: true, sourceURL: file.uri, file});
                        }
                    },
                    show: () => {
                        this.setState({isModalOpen: true});
                    },
                })}
            </>
        );
    }
}

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AttachmentModal);
