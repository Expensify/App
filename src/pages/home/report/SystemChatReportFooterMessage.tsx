import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Banner from '@components/Banner';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import * as ReportInstance from '@userActions/Report';
import type {OnboardingPurposeType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy as PolicyType, Report} from '@src/types/onyx';

type SystemChatReportFooterMessageOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    choice: OnyxEntry<OnboardingPurposeType>;

    /** Collection of reports */
    reports: OnyxCollection<Report>;

    /** The list of this user's policies */
    policies: OnyxCollection<PolicyType>;
};

type SystemChatReportFooterMessageProps = SystemChatReportFooterMessageOnyxProps;

function SystemChatReportFooterMessage({choice, reports, policies}: SystemChatReportFooterMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const adminChatReport = useMemo(() => {
        const adminsReports = Object.values(reports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);
        const activePolicies = Object.values(policies ?? {}).filter((policy) => PolicyUtils.shouldShowPolicy(policy, false));

        return adminsReports.find((report) => activePolicies.find((policy) => policy?.id === report?.policyID));
    }, [policies, reports]);

    const content = useMemo(() => {
        switch (choice) {
            case CONST.ONBOARDING_CHOICES.MANAGE_TEAM:
                return (
                    <>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase1')}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminChatReport?.reportID ?? ''))}>
                            {adminChatReport?.reportName ?? CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}
                        </TextLink>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase2')}
                    </>
                );
            default:
                return (
                    <>
                        {translate('systemChatFooterMessage.default.phrase1')}
                        <TextLink onPress={() => ReportInstance.navigateToConciergeChat()}>{CONST?.CONCIERGE_CHAT_NAME}</TextLink>
                        {translate('systemChatFooterMessage.default.phrase2')}
                    </>
                );
        }
    }, [adminChatReport?.reportName, adminChatReport?.reportID, choice, translate]);

    return (
        <Banner
            containerStyles={[styles.archivedReportFooter]}
            shouldShowIcon
            icon={Expensicons.Lightbulb}
            content={<Text suppressHighlighting>{content}</Text>}
        />
    );
}

SystemChatReportFooterMessage.displayName = 'SystemChatReportFooterMessage';

export default withOnyx<SystemChatReportFooterMessageProps, SystemChatReportFooterMessageOnyxProps>({
    choice: {
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(SystemChatReportFooterMessage);
