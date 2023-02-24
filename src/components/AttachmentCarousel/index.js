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
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../../pages/reportPropTypes';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),
};

const defaultProps = {
    source: '',
    report: {
        isLoadingMoreReportActions: false,
        reportID: '',
    },
    reportActions: {},
    onNavigate: () => {},
};

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        this.canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
        this.fetchMoreActions = this.fetchMoreActions.bind(this);

        this.state = {
            attachments: [],
            source: this.props.source,
            shouldShowArrow: this.canUseTouchScreen,
            isForwardDisabled: true,
            isBackDisabled: true,
            isLoading: true,
        };
    }

    componentDidMount() {
        this.makeStateWithReports();
    }

    componentDidUpdate(prevProps) {
        const previousReportActionsCount = _.size(prevProps.reportActions);
        const currentReportActionsCount = _.size(this.props.reportActions);
        if (previousReportActionsCount === currentReportActionsCount) {
            return;
        }
        this.makeStateWithReports();
    }

    /**
     * Helps to navigate between next/previous attachments
     * @param {Object} attachmentItem
     * @returns {Object}
     */
    getAttachment(attachmentItem) {
        const source = _.get(attachmentItem, 'source', '');
        const file = _.get(attachmentItem, 'file', {name: ''});
        this.props.onNavigate({source: addEncryptedAuthTokenToURL(source), file});

        return {
            source,
            file,
        };
    }

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} shouldShowArrow
     */
    toggleArrowsVisibility(shouldShowArrow) {
        this.setState({shouldShowArrow});
    }

    /**
     * This is called when there are new reports to set the state
     */
    makeStateWithReports() {
        let page;
        const actions = ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions), true);

        /**
         * Looping to filter out attachments and retrieve the src URL and name of attachments.
         */
        const attachments = [];
        _.forEach(actions, ({originalMessage, message}) => {
            // Check for attachment which hasn't been deleted
            if (!originalMessage || !originalMessage.html || _.some(message, m => m.isEdited)) {
                return;
            }
            const matches = [...originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA)];

            // matchAll captured both source url and name of the attachment
            if (matches.length === 2) {
                const [originalSource, name] = _.map(matches, m => m[2]);

                // Update the image URL so the images can be accessed depending on the config environment.
                // Eg: while using Ngrok the image path is from an Ngrok URL and not an Expensify URL.
                const source = tryResolveUrlFromApiRoot(originalSource);
                if (source === this.state.source) {
                    page = attachments.length;
                }

                attachments.push({source, file: {name}});
            }
        });

        // If there's no more attachments added from fetching older messages then call this again
        if (attachments.length === this.state.attachments.length) {
            this.fetchMoreActions();
            return;
        }

        const {file} = this.getAttachment(attachments[page]);
        this.setState({
            page,
            attachments,
            file,
            isLoading: false,
            isForwardDisabled: page === 0,
            isBackDisabled: page === attachments.length - 1,
        });
    }

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
    */
    cycleThroughAttachments(deltaSlide) {
        if ((deltaSlide < 0 && this.state.isForwardDisabled) || (deltaSlide > 0 && this.state.isBackDisabled)) {
            return;
        }

        this.setState(({attachments, page}) => {
            const nextIndex = page + deltaSlide;

            // Check if index is near the end of the list to fetch more reports
            if (attachments.length === nextIndex - 1) {
                this.fetchMoreReports();
            }

            const {source, file} = this.getAttachment(attachments[nextIndex]);
            return {
                page: nextIndex,
                source,
                file,
                isBackDisabled: nextIndex === attachments.length - 1,
                isForwardDisabled: nextIndex === 0,
            };
        });
    }

    /**
     * used to make an api call that fetches more actions
     */
    fetchMoreActions() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.props.report.isLoadingMoreReportActions) {
            return;
        }

        const sortedActions = ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions), true);
        const oldestReportAction = _.last(sortedActions);

        // Load more chats if the last action is not a created type
        if (oldestReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
            Report.readOldestAction(this.props.report.reportID, oldestReportAction.reportActionID);
            this.setState({isLoading: true});
        }
    }

    render() {
        if (!this.state.source) {
            return null;
        }
        const authSource = addEncryptedAuthTokenToURL(this.state.source);
        return (
            <View
                style={[styles.attachmentModalArrowsContainer]}
                onMouseEnter={() => this.toggleArrowsVisibility(true)}
                onMouseLeave={() => this.toggleArrowsVisibility(false)}
            >
                {(this.state.shouldShowArrow && !this.state.isLoading) && (
                    <>
                        {!this.state.isBackDisabled && (
                            <Button
                                medium
                                style={[styles.leftAttachmentArrow]}
                                innerStyles={[styles.arrowIcon]}
                                icon={Expensicons.BackArrow}
                                iconFill={themeColors.text}
                                iconStyles={[styles.mr0]}
                                onPress={() => this.cycleThroughAttachments(1)}
                            />
                        )}
                        {!this.state.isForwardDisabled && (
                            <Button
                                medium
                                style={[styles.rightAttachmentArrow]}
                                innerStyles={[styles.arrowIcon]}
                                icon={Expensicons.ArrowRight}
                                iconFill={themeColors.text}
                                iconStyles={[styles.mr0]}
                                onPress={() => this.cycleThroughAttachments(-1)}
                            />
                        )}
                    </>
                )}
                {this.state.isLoading ? (
                    <FullScreenLoadingIndicator
                        style={[styles.opacity1, styles.bgTransparent]}
                    />
                ) : (
                    <CarouselActions
                        styles={[styles.attachmentModalArrowsContainer]}
                        canSwipeLeft={!this.state.isBackDisabled}
                        canSwipeRight={!this.state.isForwardDisabled}
                        onPress={() => this.canUseTouchScreen && this.toggleArrowsVisibility(!this.state.shouldShowArrow)}
                        onCycleThroughAttachments={this.cycleThroughAttachments}
                    >
                        <AttachmentView
                            onPress={() => this.toggleArrowsVisibility(!this.state.shouldShowArrow)}
                            source={authSource}
                            file={this.state.file}
                        />
                    </CarouselActions>
                )}
            </View>
        );
    }
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
    reportActions: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        canEvict: false,
    },
})(AttachmentCarousel);
