import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportWelcomeText from '@components/ReportWelcomeText';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

type ReportActionItemCreatedOnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy object for the current route */
    policy: OnyxEntry<Policy>;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportActionItemCreatedProps = ReportActionItemCreatedOnyxProps & {
    /** The id of the report */
    reportID: string;

    /** The id of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string | undefined;
};
function ReportActionItemCreated({report, personalDetails, policy, reportID}: ReportActionItemCreatedProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
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
                            onPress={() => ReportUtils.navigateToDetailsPage(report)}
                            style={[styles.mh5, styles.mb3, styles.alignSelfStart, shouldDisableDetailPage && styles.cursorDefault]}
                            accessibilityLabel={translate('common.details')}
                            role={CONST.ROLE.BUTTON}
                            disabled={shouldDisableDetailPage}
                        >
                            <MultipleAvatars
                                icons={icons}
                                size={isLargeScreenWidth || (icons && icons.length < 3) ? CONST.AVATAR_SIZE.LARGE : CONST.AVATAR_SIZE.MEDIUM}
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

export default function ComponentWithOnyx(props: Omit<ReportActionItemCreatedProps, keyof ReportActionItemCreatedOnyxProps>) {
    const [report, reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.reportID}`);
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.policyID}`);
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    if (isLoadingOnyxValue(reportMetadata, policyMetadata, personalDetailsMetadata)) {
        return null;
    }

    return (
        <ReportActionItemCreated
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            report={report}
            policy={policy}
            personalDetails={personalDetails}
        />
    );
}
