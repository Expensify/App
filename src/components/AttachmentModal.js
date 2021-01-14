import {
    Dimensions,
    View,
} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash.get';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {clearAttachmentModalData, setAttachmentModalData} from '../libs/actions/Report';
import AttachmentView from './AttachmentView';
import CONST from '../CONST';
import ModalWithHeader from './ModalWithHeader';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import addAuthTokenToURL from '../libs/addAuthTokenToURL';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import KeyboardShortcut from '../libs/KeyboardShortcut';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    // Array of report actions for this report
    sortedReportAttachments: PropTypes.arrayOf(PropTypes.shape({
        action: PropTypes.shape(ReportActionPropTypes),
        index: PropTypes.number.isRequired,
    })),

    // Current visible attachment
    visibleAttachment: PropTypes.shape({
        sourceURL: PropTypes.string,
        isAttachment: PropTypes.bool,
        isModalOpen: PropTypes.bool,
        file: PropTypes.shape({name: PropTypes.string}),
    }),

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    sortedReportAttachments: [],
    visibleAttachment: {
        sourceURL: null,
        isAttachment: false,
        isModalOpen: false,
        file: {name: ''},
    },
};

class AttachmentModal extends Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.getNextAttachment = this.getNextAttachment.bind(this);
        this.getAttachmentSource = this.getAttachmentSource.bind(this);

        this.state = {
            title: 'Attachment',
        };
    }

    componentDidUpdate(prevProps) {
        const {visibleAttachment} = this.props;
        if (!prevProps.visibleAttachment.isModalOpen && visibleAttachment.isModalOpen) {
            KeyboardShortcut.subscribe("'", () => {
                this.getNextAttachment('right');
            }, [], false);
            KeyboardShortcut.subscribe('%', () => {
                this.getNextAttachment('left');
            }, [], false);
        } else if (!visibleAttachment.isModalOpen) {
            KeyboardShortcut.unsubscribe("'");
            KeyboardShortcut.unsubscribe('%');
        }
    }

    /**
     * A function which uses regex to get the src attribute from the html img tag
     *
     * @param {String} htmlString
     * @returns {String}
     */
    getAttachmentSource(htmlString) {
        const imgRegx = /<img.*?data-expensify-source="(.*?)"[^>]+>/g;
        const imageGroup = imgRegx.exec(htmlString);
        return imageGroup[1];
    }

    /**
     * A function to get the next attachment based on the current attachment being show in the report.
     *
     * @param {String} direction
     */
    getNextAttachment = (direction) => {
        const {sortedReportAttachments, visibleAttachment} = this.props;

        // Finding the current attachment inside the report using the sourceURL
        const currentAttachment = sortedReportAttachments.find((attachment) => {
            const html = lodashGet(attachment, ['action', 'message', 0, 'html'], '');
            return html.includes(visibleAttachment.sourceURL);
        });

        if (!currentAttachment) {
            return;
        }

        const currentSequenceNumber = currentAttachment.action.sequenceNumber;
        const nextAttachmentAction = _.chain(sortedReportAttachments)
            .pluck('action')
            .filter(action => (direction === 'right'
                ? action.sequenceNumber > currentSequenceNumber
                : action.sequenceNumber < currentSequenceNumber))
            .first()
            .value();

        if (nextAttachmentAction) {
            const html = lodashGet(nextAttachmentAction, ['message', 0, 'html'], '');
            const attachmentSource = this.getAttachmentSource(html);
            setAttachmentModalData({
                sourceURL: attachmentSource, isAttachment: true, isModalOpen: true, file: null,
            });
        }
    }

    /**
     * Function used to handle Left and Right key presses.
     * This is a seperate function so that it can be subscribed/unsubscribed from the events
     * @param {Object} event
     * @param {String} event.key
     * @param {Function} event.stopPropagation
     */
    handleKeyPress = (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.stopPropagation();
            const direction = event.key === 'ArrowRight' ? 'right' : 'left';
            this.getNextAttachment(direction);
        }
    }

    render() {
        const sourceURL = addAuthTokenToURL({
            url: this.props.visibleAttachment.sourceURL,
            authToken: this.props.session.authToken,
            required: this.props.visibleAttachment.isAttachment,
        });

        const isSmallScreen = Dimensions.get('window').width < variables.mobileResponsiveWidthBreakpoint;
        const attachmentViewStyles = isSmallScreen
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];
        return (
            <>
                <ModalWithHeader
                    type={CONST.MODAL.MODAL_TYPE.CENTERED}
                    onClose={() => clearAttachmentModalData()}
                    isVisible={this.props.visibleAttachment.isModalOpen}
                    title={this.state.title}
                    backgroundColor={themeColors.componentBG}
                >
                    <View style={attachmentViewStyles}>
                        {this.props.visibleAttachment.sourceURL && (
                            <AttachmentView sourceURL={sourceURL} file={this.props.visibleAttachment.file} />
                        )}
                    </View>
                </ModalWithHeader>
            </>
        );
    }
}

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
export default withOnyx({
    visibleAttachment: {key: ONYXKEYS.ATTACHMENT_MODAL},
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AttachmentModal);
