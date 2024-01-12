import React, {memo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportWelcomeText from '@components/ReportWelcomeText';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import reportWithoutHasDraftSelector from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import * as ReportUtils from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy being used */
    policy: OnyxEntry<Policy>;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportActionItemCreatedProps = OnyxProps & {
    /** The id of the report */
    reportID: string;

    /** The id of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;

    /** The policy object for the current route */
    policy?: {
        /** The name of the policy */
        name?: string;

        /** The URL for the policy avatar */
        avatar?: string;
    };
}
function ReportActionItemCreated(props: ReportActionItemCreatedProps) {

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {translate} = useLocalize();
    const {isSmallScreenWidth, isLargeScreenWidth} = useWindowDimensions();

    if (!ReportUtils.isChatReport(props.report)) {
        return null;
    }

    const icons = ReportUtils.getIcons(props.report, props.personalDetails);
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(props.report);

    return (
        <OfflineWithFeedback
            pendingAction={props.report?.pendingFields?.addWorkspaceRoom ?? props.report?.pendingFields?.createChat ?? undefined}
            errors={props.report?.errorFields?.addWorkspaceRoom ?? props.report?.errorFields?.createChat ?? undefined}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => navigateToConciergeChatAndDeleteReport(props.report?.reportID ?? props.reportID)}
            needsOffscreenAlphaCompositing
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)}>
                <AnimatedEmptyStateBackground />
                <View
                    accessibilityLabel={translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}
                >
                    <PressableWithoutFeedback
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.mh5, styles.mb3, styles.alignSelfStart]}
                        accessibilityLabel={translate('common.details')}
                        role={CONST.ROLE.BUTTON}
                        disabled={shouldDisableDetailPage}
                    >
                        <MultipleAvatars
                            icons={icons}
                            size={isLargeScreenWidth || (icons && icons.length < 3) ? CONST.AVATAR_SIZE.LARGE : CONST.AVATAR_SIZE.MEDIUM}
                            shouldStackHorizontally
                            shouldDisplayAvatarsInRows={isSmallScreenWidth}
                            maxAvatarsInRow={isSmallScreenWidth ? CONST.AVATAR_ROW_SIZE.DEFAULT : CONST.AVATAR_ROW_SIZE.LARGE_SCREEN}
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

ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default withOnyx<ReportActionItemCreatedProps, OnyxProps>({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            selector: reportWithoutHasDraftSelector,
        },

        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
        
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        
    })(
    memo(
        ReportActionItemCreated,
        (prevProps, nextProps) =>
            prevProps.policy?.name === nextProps.policy?.name &&
            prevProps.policy?.avatar === nextProps.policy?.avatar &&
            prevProps.report?.lastReadTime === nextProps.report?.lastReadTime &&
            prevProps.report?.statusNum === nextProps.report?.statusNum &&
            prevProps.report?.stateNum === nextProps.report?.stateNum,
    ),
);
