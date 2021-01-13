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

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    // Array of report actions for this report
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape({
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
    sortedReportActions: [],
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
            document.addEventListener('keydown', this.handleKeyPress, false);
        } else if (!visibleAttachment.isModalOpen) {
            document.removeEventListener('keydown', this.handleKeyPress, false);
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
        const {sortedReportActions, visibleAttachment: {sourceURL}} = this.props;
        const attachments = _.filter(sortedReportActions, sortedReportAction => sortedReportAction.action.isAttachment);
        if (attachments.length <= 1) {
            return;
        }

        // Finding the current attachment inside the report using the sourceURL
        const currentAttachment = attachments.find((attachment) => {
            const html = lodashGet(attachment, ['action', 'message', 0, 'html'], '');
            return html.includes(sourceURL);
        });
        if (!currentAttachment) {
            return;
        }
        const actions = [...sortedReportActions].reverse();
        const sequenceNumber = currentAttachment.action.sequenceNumber;
        const actionsToSearch = direction === 'right'
            ? actions.slice(sequenceNumber)
            : actions.slice(0, sequenceNumber !== 0 ? sequenceNumber - 1 : 0).reverse();
        let nextAttachment = actionsToSearch.find(actionResult => actionResult.action.isAttachment);

        // If there is no next attachment in the left or right direction,
        // then we need to loop to get the next attachment after the end of the array
        if (!nextAttachment) {
            const actionsToSearchFromBeginning = direction === 'right' ? actions : [...actions].reverse();
            nextAttachment = actionsToSearchFromBeginning.find(actionResult => actionResult.action.isAttachment);
        }
        const html = lodashGet(nextAttachment, ['action', 'message', 0, 'html'], '');
        const attachmentSource = this.getAttachmentSource(html);
        setAttachmentModalData({
            sourceURL: attachmentSource, isAttachment: true, isModalOpen: true, file: null,
        });
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
