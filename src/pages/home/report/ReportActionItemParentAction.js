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
    const icons = ReportUtils.getIcons(props.report, props.personalDetails);
    console.log('RESULTING ReportActionItemParentAction PROPS: ', props);
    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={StyleUtils.getReportWelcomeBackgroundImageStyle(props.isSmallScreenWidth)}
                />
                <View
                    accessibilityLabel={props.translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}
                >
                    <Pressable
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.ph5, styles.pb3, styles.alignSelfStart]}
                    >
                        <RoomHeaderAvatars
                            icons={icons}
                        />
                    </Pressable>
                    <View style={[styles.ph5]}>
                        <View>
                            <Text style={[styles.textHero, styles.fontColorReactionLabel]}>
                                This is a thread!
                            </Text>
                        </View>
                    </View>
                </View>
                { console.log('>>>>', props, 'for ', props.parentReportID, ' id: ', props.parentReportActionID, props.parentReportActions)}
                { (props.parentReport && props.parentReportActions && props.parentReportActionID && props.parentReportActions[`${props.parentReportActionID}`]) ?
                    (<ReportActionItem
                        report={props.report}
                        action={props.parentReportActions[`${props.parentReportActionID}`]}
                        displayAsGroup={false}
                        isMostRecentIOUReportAction={false}
                        shouldDisplayNewMarker={false}
                        index={0}
                    />) : (
                        <View>
                        <Text style={[styles.textHero, styles.fontColorReactionLabel]}>
                            {`ReportName: ${props.report.reportName} The parent report is: ${props.parentReportID} and the action is: ${props.parentReportActionID}!`}
                        </Text>
                    </View>
                    )
                }
            </View>
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

        // parentReportAction: {
        //     key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        //     canEvict: false,
        //     selector: (reportActions, props) => {console.log('SELECTOR PROPS', reportActions, props); return lodashGet(reportActions, '2998605018361368979', {});}
        // },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ReportActionItemParentAction);
