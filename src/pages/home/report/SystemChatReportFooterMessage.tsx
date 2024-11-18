import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Banner from '@components/Banner';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import * as ReportInstance from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SystemChatReportFooterMessage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [choice] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    const adminChatReportID = useMemo(() => {
        const adminPolicy = activePolicyID
            ? PolicyUtils.getPolicy(activePolicyID)
            : Object.values(policies ?? {}).find(
                  (policy) => PolicyUtils.shouldShowPolicy(policy, false, currentUserLogin) && policy?.role === CONST.POLICY.ROLE.ADMIN && policy?.chatReportIDAdmins,
              );

        return String(adminPolicy?.chatReportIDAdmins ?? -1);
    }, [activePolicyID, policies, currentUserLogin]);

    const [adminChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${adminChatReportID}`);

    const content = useMemo(() => {
        switch (choice) {
            case CONST.ONBOARDING_CHOICES.MANAGE_TEAM:
                return (
                    <>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase1')}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminChatReport?.reportID ?? '-1'))}>
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
            containerStyles={[styles.chatFooterBanner]}
            shouldShowIcon
            icon={Expensicons.Lightbulb}
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
