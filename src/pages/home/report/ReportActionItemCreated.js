import React, {memo} from 'react';
import {View, Image} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
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
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import MultipleAvatars from '../../../components/MultipleAvatars';
import CONST from '../../../CONST';

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    report: {},
    personalDetails: {},
    policy: {},
};

function ReportActionItemCreated(props) {
    if (!ReportUtils.isChatReport(props.report)) {
        return null;
    }

    const icons = ReportUtils.getIcons(props.report, props.personalDetails);
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(props.report);

    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
            needsOffscreenAlphaCompositing
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
                    <PressableWithoutFeedback
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.mh5, styles.mb3, styles.alignSelfStart]}
                        accessibilityLabel={props.translate('common.details')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        disabled={shouldDisableDetailPage}
                    >
                        <MultipleAvatars
                            icons={icons}
                            size={props.isLargeScreenWidth || (icons && icons.length < 3) ? CONST.AVATAR_SIZE.LARGE : CONST.AVATAR_SIZE.MEDIUM}
                            shouldStackHorizontally
                            shouldDisplayAvatarsInRows={props.isSmallScreenWidth}
                            maxAvatarsInRow={props.isSmallScreenWidth ? CONST.AVATAR_ROW_SIZE.DEFAULT : CONST.AVATAR_ROW_SIZE.LARGE_SCREEN}
                        />
                    </PressableWithoutFeedback>
                    <View style={[styles.ph5]}>
                        <ReportWelcomeText
                            report={props.report}
                            policy={props.policy}
                        />
                    </View>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

ReportActionItemCreated.defaultProps = defaultProps;
ReportActionItemCreated.propTypes = propTypes;
ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(
    memo(
        ReportActionItemCreated,
        (prevProps, nextProps) =>
            lodashGet(prevProps.props, 'policy.name') === lodashGet(nextProps, 'policy.name') &&
            lodashGet(prevProps.props, 'policy.avatar') === lodashGet(nextProps, 'policy.avatar') &&
            lodashGet(prevProps.props, 'report.lastReadTime') === lodashGet(nextProps, 'report.lastReadTime') &&
            lodashGet(prevProps.props, 'report.statusNum') === lodashGet(nextProps, 'report.statusNum') &&
            lodashGet(prevProps.props, 'report.stateNum') === lodashGet(nextProps, 'report.stateNum'),
    ),
);
