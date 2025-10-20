import {emailSelector} from '@selectors/Session';
import React, {useMemo} from 'react';
import Banner from '@components/Banner';
import {Lightbulb} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SystemChatReportFooterMessage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const [choice] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const adminChatReportID = useMemo(() => {
        const adminPolicy = activePolicyID
            ? // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              getPolicy(activePolicyID)
            : Object.values(policies ?? {}).find((policy) => shouldShowPolicy(policy, false, currentUserLogin) && policy?.role === CONST.POLICY.ROLE.ADMIN && policy?.chatReportIDAdmins);

        return String(adminPolicy?.chatReportIDAdmins ?? -1);
    }, [activePolicyID, policies, currentUserLogin]);

    const [adminChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${adminChatReportID}`, {canBeMissing: true});

    const content = useMemo(() => {
        switch (choice) {
            case CONST.ONBOARDING_CHOICES.MANAGE_TEAM:
                return (
                    <>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase1')}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminChatReport?.reportID))}>
                            {adminChatReport?.reportName ?? CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}
                        </TextLink>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase2')}
                    </>
                );
            default:
                return (
                    <>
                        {translate('systemChatFooterMessage.default.phrase1')}
                        <TextLink onPress={() => navigateToConciergeChat()}>{CONST?.CONCIERGE_CHAT_NAME}</TextLink>
                        {translate('systemChatFooterMessage.default.phrase2')}
                    </>
                );
        }
    }, [adminChatReport?.reportName, adminChatReport?.reportID, choice, translate]);

    return (
        <Banner
            containerStyles={[styles.chatFooterBanner]}
            shouldShowIcon
            icon={Lightbulb}
            content={
                <Text
                    suppressHighlighting
                    style={styles.flex1}
                >
                    {content}
                </Text>
            }
        />
    );
}

SystemChatReportFooterMessage.displayName = 'SystemChatReportFooterMessage';

export default SystemChatReportFooterMessage;
