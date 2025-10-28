import {emailSelector} from '@selectors/Session';
import React, {useMemo} from 'react';
import Banner from '@components/Banner';
import {Lightbulb} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SystemChatReportFooterMessage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
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
                    <RenderHTML
                        html={translate('systemChatFooterMessage.newDotManageTeam', {
                            adminReportName: adminChatReport?.reportName ?? CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
                            href: `${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(adminChatReport?.reportID)}`,
                        })}
                    />
                );
            default:
                return <RenderHTML html={translate('systemChatFooterMessage.default')} />;
        }
    }, [adminChatReport?.reportName, adminChatReport?.reportID, choice, translate, environmentURL]);

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
