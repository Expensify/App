import React from 'react';
import {Pressable, View, Image, Text} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
import RoomHeaderAvatars from '../../../components/RoomHeaderAvatars';
import ReportWelcomeText from '../../../components/ReportWelcomeText';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as Report from '../../../libs/actions/Report';
import reportPropTypes from '../../reportPropTypes';
import EmptyStateBackgroundImage from '../../../../assets/images/empty-state_background-fade.png';
import * as StyleUtils from '../../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';
import withLocalize from '../../../components/withLocalize';
import ReportActionItem from './ReportActionItem';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    parentReportID: PropTypes.number.isRequired,

    parentReportActionID: PropTypes.number.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    parentReport: reportPropTypes,

    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    // parentReportAction: PropTypes.shape(reportActionPropTypes),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    report: {},
    personalDetails: {},
    parentReportActions: {},

    // parentReportAction: {},
    parentReport: {},
};

const ReportActionItemParentAction = (props) => {
    // const parentReportActionID = '7267239632810500313';
    // let parentReportAction = props.parentReportActions['7267239632810500313'];
    const parentReportAction = ReportUtils.findMatchingValueDEVTESTING(props.parentReportActions, `${props.report.parentReportActionID}`);
    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}/>
                { (parentReportAction) ?
                    (<ReportActionItem
                        report={props.report}
                        action={parentReportAction} // {props.parentReportActions[`${props.parentReportActionID}`]}
                        displayAsGroup={false}
                        isMostRecentIOUReportAction={false}
                        shouldDisplayNewMarker={false}
                        index={0}
                    />) : (
                        <View>
                        <Text style={[styles.textHero, styles.fontColorReactionLabel]}>
                            {`Error Displaying ReportName: ${props.report.reportName} The parent report is: ${props.parentReportID} and the action is: ${props.parentReportActionID}!`}
                        </Text>
                        </View>
                    )
                }
            </View>
            <View style={[styles.threadDividerLine]} />
        </OfflineWithFeedback>
    );
};

ReportActionItemParentAction.defaultProps = defaultProps;
ReportActionItemParentAction.propTypes = propTypes;
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        parentReport: {
            key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
        },
        parentReportActions: {
            key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            canEvict: false,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ReportActionItemParentAction);
