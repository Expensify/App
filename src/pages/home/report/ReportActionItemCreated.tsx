import React, {memo} from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ReportWelcomeText from '@components/ReportWelcomeText';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isChatReport, isCurrentUserInvoiceReceiver, isInvoiceRoom, navigateToDetailsPage, shouldDisableDetailPage as shouldDisableDetailPageReportUtils} from '@libs/ReportUtils';
import {clearCreateChatError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

type ReportActionItemCreatedProps = {
    /** The id of the report */
    reportID: string | undefined;

    /** The id of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string | undefined;
};
function ReportActionItemCreated({reportID, policyID}: ReportActionItemCreatedProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    if (!isChatReport(report)) {
        return null;
    }

    const shouldDisableDetailPage = shouldDisableDetailPageReportUtils(report);

    return (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat}
            errors={report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => clearCreateChatError(report)}
        >
            <View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground />
                <View
                    accessibilityLabel={translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5]}
                >
                    <OfflineWithFeedback pendingAction={report?.pendingFields?.avatar}>
                        <PressableWithoutFeedback
                            onPress={() => navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute(), true)}
                            style={[styles.mh5, styles.mb3, styles.alignSelfStart, shouldDisableDetailPage && styles.cursorDefault]}
                            accessibilityLabel={translate('common.details')}
                            role={CONST.ROLE.BUTTON}
                            disabled={shouldDisableDetailPage}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_CREATED}
                        >
                            <ReportActionAvatars
                                reportID={reportID}
                                size={CONST.AVATAR_SIZE.X_LARGE}
                                horizontalStacking={{
                                    displayInRows: shouldUseNarrowLayout,
                                    maxAvatarsInRow: shouldUseNarrowLayout ? CONST.AVATAR_ROW_SIZE.DEFAULT : CONST.AVATAR_ROW_SIZE.LARGE_SCREEN,
                                    overlapDivider: 4,
                                    sort: isInvoiceRoom(report) && isCurrentUserInvoiceReceiver(report) ? CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE : undefined,
                                }}
                            />
                        </PressableWithoutFeedback>
                    </OfflineWithFeedback>
                    <View style={[styles.ph5]}>
                        <ReportWelcomeText
                            report={report}
                            policy={policy}
                        />
                    </View>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

export default memo(ReportActionItemCreated);
