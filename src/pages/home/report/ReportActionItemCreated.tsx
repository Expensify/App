import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportWelcomeText from '@components/ReportWelcomeText';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

type ReportActionItemCreatedProps = {
    /** The id of the report */
    reportID: string;

    /** The id of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string | undefined;
};
function ReportActionItemCreated({reportID, policyID}: ReportActionItemCreatedProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : -1}`);

    if (!ReportUtils.isChatReport(report)) {
        return null;
    }

    let icons = ReportUtils.getIcons(report, personalDetails, null, '', -1, undefined, invoiceReceiverPolicy);
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(report);

    if (ReportUtils.isInvoiceRoom(report) && ReportUtils.isCurrentUserInvoiceReceiver(report)) {
        icons = [...icons].reverse();
    }

    return (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat}
            errors={report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => navigateToConciergeChatAndDeleteReport(report?.reportID ?? reportID, undefined, true)}
        >
            <View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground />
                <View
                    accessibilityLabel={translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5]}
                >
                    <OfflineWithFeedback pendingAction={report?.pendingFields?.avatar}>
                        <PressableWithoutFeedback
                            onPress={() => ReportUtils.navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute())}
                            style={[styles.mh5, styles.mb3, styles.alignSelfStart, shouldDisableDetailPage && styles.cursorDefault]}
                            accessibilityLabel={translate('common.details')}
                            role={CONST.ROLE.BUTTON}
                            disabled={shouldDisableDetailPage}
                        >
                            <MultipleAvatars
                                icons={icons}
                                size={CONST.AVATAR_SIZE.XLARGE}
                                overlapDivider={4}
                                shouldStackHorizontally
                                shouldDisplayAvatarsInRows={shouldUseNarrowLayout}
                                maxAvatarsInRow={shouldUseNarrowLayout ? CONST.AVATAR_ROW_SIZE.DEFAULT : CONST.AVATAR_ROW_SIZE.LARGE_SCREEN}
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

ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default ReportActionItemCreated;
