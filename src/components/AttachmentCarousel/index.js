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
        reportID: '',
    },
    reportActions: {},
    onNavigate: () => {},
};

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        this.canUseTouchScreen = canUseTouchScreen();
        this.makeStateWithReports = this.makeStateWithReports.bind(this);
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
        this.props.onNavigate({sourceURL: addEncryptedAuthTokenToURL(sourceURL), file});

        return {
            sourceURL,
            file,
        };
    }

    /**
     * This is called when there are new reports to set the state
     */
    makeStateWithReports() {
        let page;
        const actionsArr = ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions), true);

        /**
         * calling reducer will filter out attachments, determine the index of opened attachment,
         * and retrieve the src url and name of attachements
         */
        const attachments = _.reduce(actionsArr, (attachmentsAccumulator, {originalMessage}) => {
            if (originalMessage && originalMessage.html) {
                const matchesIt = originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA);
                const matches = [...matchesIt];

                // matchAll captured both source url and name of the attachment
                if (matches.length === 2) {
                    const [sourceURL, name] = _.map(matches, m => m[2]);
                    if ((this.state.sourceURL && sourceURL.includes(this.state.sourceURL))
                        || (!this.state.sourceURL && sourceURL.includes(this.props.sourceURL))) {
                        page = attachmentsAccumulator.length;
                    }
                    attachmentsAccumulator.push({sourceURL, file: {name}});
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
     * increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
    */
    cycleThroughAttachments(deltaSlide) {
        if ((deltaSlide < 0 && this.state.isForwardDisabled) || (deltaSlide > 0 && this.state.isBackDisabled)) {
            return;
        }

        this.setState(({attachments, page}) => {
            const nextIndex = page + deltaSlide;
            if (attachments.length - nextIndex < 10) {
                Report.loadMoreActions(this.props.report.reportID, this.props.reportActions, this.props.report.isLoadingMoreReportActions);
            }
            const {sourceURL, file} = this.getAttachment(attachments[nextIndex]);
            return {
                page: nextIndex,
                sourceURL,
                file,
                isBackDisabled: nextIndex === attachments.length - 1,
                isForwardDisabled: nextIndex === 0,
            };
        });
    }

    render() {
        if (!this.state.sourceURL) {
            return null;
        }
        const authSourceURL = addEncryptedAuthTokenToURL(this.state.sourceURL);
        return (
            <View
                style={[styles.attachmentModalArrowsContainer]}
                onMouseEnter={() => this.onShowArrow(true)}
                onMouseLeave={() => this.onShowArrow(false)}
            >
                {this.state.shouldShowArrow && (
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
                                isDisabled={this.state.isForwardDisabled}
                            />
                        )}
                    </>
                )}

                <CarouselActions
                    styles={[styles.attachmentModalArrowsContainer]}
                    canSwipeLeft={!this.state.isBackDisabled}
                    canSwipeRight={!this.state.isForwardDisabled}
                    onPress={() => this.canUseTouchScreen && this.onShowArrow(!this.state.shouldShowArrow)}
                    onCycleThroughAttachments={this.cycleThroughAttachments}
                >
                    <AttachmentView onPress={() => this.onShowArrow(!this.state.shouldShowArrow)} sourceURL={authSourceURL} file={this.state.file} />
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
