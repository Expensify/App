import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import participantPropTypes from '@components/participantPropTypes';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportWelcomeText from '@components/ReportWelcomeText';
import withLocalize from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import reportWithoutHasDraftSelector from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

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
    const styles = useThemeStyles();
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
                <AnimatedEmptyStateBackground />
                <View
                    accessibilityLabel={props.translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}
                >
                    <PressableWithoutFeedback
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.mh5, styles.mb3, styles.alignSelfStart]}
                        accessibilityLabel={props.translate('common.details')}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
            selector: reportWithoutHasDraftSelector,
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
