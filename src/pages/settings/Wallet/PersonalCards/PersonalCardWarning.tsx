import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import HeaderPageLayout from '@components/HeaderPageLayout';
import {View} from 'react-native';
import Text from '@components/Text';
import Button from '@components/Button';
import useActiveAdminPolicies from '@hooks/useActiveAdminPolicies';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import ROUTES from '@src/ROUTES';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {getPolicyExpenseChat} from '@libs/ReportUtils';

function PersonalCardWarning() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardFeedsByPolicy} = useCardFeedsForDisplay();
    const {accountID} = useCurrentUserPersonalDetails();
    // All policies in which the current user is admin (active workspaces only)
    const adminPolicies = useActiveAdminPolicies();
    const adminPolicyIds = new Set(adminPolicies.map((p) => p.id));

    // Policy IDs from cardFeedsByPolicy in which the user is admin
    const adminPolicyIdsInCardFeeds = Object.keys(cardFeedsByPolicy).filter((policyID) => adminPolicyIds.has(policyID));
    const adminPoliciesCountInCardFeeds = adminPolicyIdsInCardFeeds.length;
    const isAdmin = adminPoliciesCountInCardFeeds > 0;

    const onPrimaryActionPress = () => {
        if (!isAdmin) {
            const policyID = Object.keys(cardFeedsByPolicy).at(0);
            if (!policyID) {
                return;
            }
            const expenseChatReportId = getPolicyExpenseChat(accountID, policyID)?.reportID;
            if (expenseChatReportId) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(expenseChatReportId));
                return;
            }
        }
        if (adminPoliciesCountInCardFeeds === 1) {
            const adminPolicyID = adminPolicyIdsInCardFeeds.at(0);
            if (!adminPolicyID) {
                return;
            }
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(adminPolicyID));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    };

    return (
        <HeaderPageLayout
            onBackButtonPress={Navigation.goBack}
            title={translate('personalCard.addPersonalCard')}
            testID="PersonalCardWarning"
            footer={
                <>
                    <Button
                        large
                        text={translate('personalCard.thisIsPersonalCard')}
                        testID="confirmation-secondary-button"
                        style={styles.mt3}
                        onPress={() => {
                            // TODO - navigate to personal card page
                        }}
                    />
                    <Button
                        success
                        large
                        text={translate(isAdmin ? 'personalCard.thisIsCompanyCard' : 'personalCard.askAdmin')}
                        testID="confirmation-primary-button"
                        style={styles.mt3}
                        pressOnEnter
                        onPress={onPrimaryActionPress}
                    />
                </>
            }
            childrenContainerStyles={[styles.pt3, styles.gap6]}
            shouldShowOfflineIndicatorInWideScreen
        >
            <View style={[styles.flex1, styles.gap4, styles.mh5]}>
                <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('personalCard.isPersonalCard')}</Text>
                <Text>{translate('personalCard.warningDescription', {isAdmin})}</Text>
            </View>
        </HeaderPageLayout>
    );
}

export default PersonalCardWarning;
