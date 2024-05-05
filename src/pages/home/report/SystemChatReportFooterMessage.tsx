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

    /** The list of this user's policies */
    // eslint-disable-next-line react/no-unused-prop-types
    policies: OnyxCollection<PolicyType>;

    /** policyID for main workspace */
    // eslint-disable-next-line react/no-unused-prop-types
    activePolicyID: OnyxEntry<Required<string>>;

    /** Workspace's #admins chat report */
    adminChatReport: OnyxEntry<Report>;
};

type SystemChatReportFooterMessageProps = SystemChatReportFooterMessageOnyxProps;

function SystemChatReportFooterMessage({adminChatReport, choice}: SystemChatReportFooterMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    activePolicyID: {
        key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
        initialValue: null,
    },
    adminChatReport: {
        key: ({activePolicyID, policies}) => {
            const adminPolicy = activePolicyID
                ? PolicyUtils.getPolicy(activePolicyID ?? '')
                : Object.values(policies ?? {}).find((policy) => PolicyUtils.shouldShowPolicy(policy, false) && policy?.role === CONST.POLICY.ROLE.ADMIN && policy?.chatReportIDAdmins);

            return `${ONYXKEYS.COLLECTION.REPORT}${adminPolicy?.chatReportIDAdmins}`;
        },
    },
})(SystemChatReportFooterMessage);
