import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import CarouselActions from './CarouselActions';
import Button from '../Button';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as Report from '../../libs/actions/Report';

import AttachmentView from '../AttachmentView';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../../pages/reportPropTypes';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';

const propTypes = {
    /** sourceUrl is used to determine the starting index in the array of attachments */
    sourceURL: PropTypes.string,

    /** Callback to update the parent modal's state with a sourceUrl and name from the attachments array */
    onNavigate: PropTypes.func,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

};

const defaultProps = {
    sourceURL: '',
    report: {
        isLoadingMoreReportActions: false,
        reportId: '',
    },
    reportActions: {},
    onNavigate: () => {},
};

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        this.canUseTouchScreen = canUseTouchScreen();
        this.makeStateWithReports = this.makeStateWithReports.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
        this.onShowArrow = this.onShowArrow.bind(this);

        this.state = {shouldShowArrow: this.canUseTouchScreen};
    }

    componentDidMount() {
        this.makeStateWithReports();
    }

    componentDidUpdate(prevProps) {
        const prevReportSize = _.size(prevProps.reportActions);
        const currReportSize = _.size(this.props.reportActions);
        if (prevReportSize === currReportSize) {
            return;
        }
        this.makeStateWithReports();
    }

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} shouldShowArrow
     */
    onShowArrow(shouldShowArrow) {
        this.setState({shouldShowArrow});
    }

    /**
     * Helps to navigate between next/previous attachments
     * @param {Object} attachmentItem
     * @returns {Object}
     */
    getAttachment(attachmentItem) {
        const sourceURL = _.get(attachmentItem, 'sourceURL', '');
        const file = _.get(attachmentItem, 'file', {name: ''});
        return {
            sourceURL: addEncryptedAuthTokenToURL(sourceURL),
            file,
        };
    }

    /**
     * This is called when there are new reports to set the state
     */
    makeStateWithReports() {
        let page;
        const actionsArr = ReportActionsUtils.getSortedReportActions(this.props.reportActions);
        console.log(actionsArr);
        const attachments = _.reduce(actionsArr, (attachmentsAccumulator, {action: reportAction}) => {
            if (reportAction.originalMessage && reportAction.originalMessage.html) {
                const matchesIt = reportAction.originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA);
                const matches = [...matchesIt];
                if (matches.length === 2) {
                    const [src, name] = matches;
                    if ((this.state.sourceURL && src[2].includes(this.state.sourceURL))
                        || (!this.state.sourceURL && src[2].includes(this.props.sourceURL))) {
                        page = attachmentsAccumulator.length;
                    }
                    const url = src[2].replace(
                        CONFIG.EXPENSIFY.EXPENSIFY_URL,
                        CONFIG.EXPENSIFY.URL_API_ROOT,
                    );
                    attachmentsAccumulator.push({sourceURL: url, file: {name: name[2]}});
                }
            }
            return attachmentsAccumulator;
        }, []);

        const {sourceURL, file} = this.getAttachment(attachments[page]);
        this.setState({
            page,
            attachments,
            sourceURL,
            file,
            isForwardDisabled: page === 0,
            isBackDisabled: page === attachments.length - 1,
        });
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.props.report.isLoadingMoreReportActions) {
            return;
        }

        const minSequenceNumber = _.chain(this.props.reportActions)
            .pluck('sequenceNumber')
            .min()
            .value();

        if (minSequenceNumber === 0) {
            return;
        }

        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments, unless we're near the beginning, in which
        // case just get everything starting from 0.
        const oldestActionSequenceNumber = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        Report.readOldestAction(this.props.report.reportID, oldestActionSequenceNumber);
    }

    /**
     * increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
    */
    cycleThroughAttachments(deltaSlide) {
        if ((deltaSlide < 0 && this.state.isForwardDisabled) || (deltaSlide > 0 && this.state.isBackDisabled)) {
            return;
        }

        this.setState(({attachments, page}) => {
            const nextIndex = page + deltaSlide;
            if (nextIndex < 10) {
                this.loadMoreChats();
            }
            const {sourceURL, file} = this.getAttachment(attachments[nextIndex]);
            this.props.onNavigate({sourceURL, file});
            return {
                page: nextIndex,
                sourceURL,
                file,
                isBackDisabled: nextIndex === 0,
                isForwardDisabled: nextIndex === attachments.length - 1,
            };
        });
    }

    render() {
        if (!this.state.sourceURL) {
            return null;
        }

        return (
            <View
                style={[styles.attachmentModalArrowsContainer]}
                onMouseEnter={() => this.onShowArrow(true)}
                onMouseLeave={() => this.onShowArrow(false)}
            >
                {this.state.shouldShowArrow && (
                    <>
                        <Button
                            medium
                            style={[styles.leftAttachmentArrow]}
                            icon={Expensicons.BackArrow}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0, {PointerEvent: 'auto'}]}
                            onPress={() => this.cycleThroughAttachments(1)}
                            isDisabled={this.state.isBackDisabled}
                        />
                        <Button
                            medium
                            style={[styles.rightAttachmentArrow]}
                            icon={Expensicons.ArrowRight}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0, {PointerEvent: 'auto'}]}
                            onPress={() => this.cycleThroughAttachments(-1)}
                            isDisabled={this.state.isForwardDisabled}
                        />
                    </>
                )}

                <CarouselActions
                    styles={[styles.attachmentModalArrowsContainer]}
                    canSwipeLeft={!this.state.isBackDisabled}
                    canSwipeRight={!this.state.isForwardDisabled}
                    onPress={() => this.canUseTouchScreen && this.onShowArrow(!this.state.shouldShowArrow)}
                    onCycleThroughAttachments={this.cycleThroughAttachments}
                >
                    <AttachmentView onPress={() => this.onShowArrow(!this.state.shouldShowArrow)} sourceURL={this.state.sourceURL} file={this.state.file} />
                </CarouselActions>

            </View>

        );
    }
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({reportId}) => `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
    },
    reportActions: {
        key: ({reportId}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
        canEvict: false,
    },
})(AttachmentCarousel);
