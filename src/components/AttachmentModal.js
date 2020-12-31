import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity, Text, Dimensions,
} from 'react-native';
import { withOnyx } from 'react-native-onyx';
import CONST from '../CONST';
import ModalWithHeader from './ModalWithHeader';
import AttachmentView from './AttachmentView';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import ONYXKEYS from '../ONYXKEYS';
import addAuthTokenToURL from '../libs/addAuthTokenToURL';
import lodashGet from 'lodash.get';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

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

    file: PropTypes.shape({ name: PropTypes.string }),

    // A function to get the next attachement based on the current attachment and the
    // direction (to the right or to the left) indicated
    getNextAttachment: PropTypes.func,

    // A function to set the attachment data that this modal receives as a prop from
    // ReportActionsView
    setAttachmentModalData: PropTypes.func,

    // A boolean indicating if the modal is currently being diplayed
    isModalOpen: PropTypes.bool,

    // The current action that the modal is currently displaying
    currentAction: PropTypes.shape(ReportActionPropTypes),

    // Optional callback to fire when we want to preview an image and approve it for use.
    onConfirm: PropTypes.func,

    // A function as a child to pass modal launching methods to
    children: PropTypes.func,

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
    isModalOpen: false,
    setAttachmentModalData: () => { },
    getNextAttachment: () => { }
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

    componentDidUpdate(prevProps) {
        if (prevProps.sourceURL !== this.props.sourceURL) {
            console.log(this.props.currentAction)
            this.setState({
                sourceURL: this.props.sourceURL,
                file: this.props.file,
                isAuthTokenRequired: this.props.currentAction.isAttachment,
                isModalOpen: true
            })
        }
        if (this.state.isModalOpen) {
            document.addEventListener("keydown", this.handleKeyPress, false);
        } else {
            document.removeEventListener("keydown", this.handleKeyPress, false);
        }
    }

    getAttachmentThumbnail(htmlString) {
        const imgRex = /<img.*?src="(.*?)"[^>]+>/g;
        const images = [];
        let img;
        while ((img = imgRex.exec(htmlString))) {
            images.push(img[1]);
        }
        return images[0]
    }

    getAttachmentSource(htmlString) {
        const imgRex = /<img.*?data-expensify-source="(.*?)"[^>]+>/g;
        const images = [];
        let img;
        while ((img = imgRex.exec(htmlString))) {
            images.push(img[1]);
        }
        return images[0]
    }

    handleKeyPress = (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.stopPropagation();
            const nextAttachment = this.props.getNextAttachment(this.props.currentAction, event.key === 'ArrowRight' ? true : false)
            if (nextAttachment) {
                const html = lodashGet(nextAttachment.action, ['message', 0, 'html'], '');
                const newSourceURL = this.getAttachmentThumbnail(html)
                const newSource = this.getAttachmentSource(html)
                this.props.setAttachmentModalData({ currentAction: nextAttachment.action, sourceURL: newSourceURL, file: { name: newSource } })
            }
        }
    }


    render() {
        const sourceURL = addAuthTokenToURL({
            url: this.state.sourceURL,
            authToken: this.props.session.authToken,
            required: this.state.isAuthTokenRequired,
        });
        const isSmallScreen = Dimensions.get('window').width < variables.mobileResponsiveWidthBreakpoint;
        const attachmentViewStyles = isSmallScreen
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];
        return (
            <>
                <ModalWithHeader
                    type={CONST.MODAL.MODAL_TYPE.CENTERED}
                    onClose={() => this.setState({ isModalOpen: false })}
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
                                this.props.setAttachmentModalData({ isModalOpen: false })
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
                {this.props.children ? this.props.children({
                    displayFileInModal: ({ file }) => {
                        if (file instanceof File) {
                            const source = URL.createObjectURL(file);
                            this.setState({
                                isModalOpen: true, sourceURL: source, file, isAuthTokenRequired: false
                            })
                        } else {
                            this.setState({
                                isModalOpen: true, sourceURL: source, file, isAuthTokenRequired: false
                            })
                        }
                    },
                    show: () => {
                        this.setState({
                            isModalOpen: true
                        })
                    },
                }) : null}
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
