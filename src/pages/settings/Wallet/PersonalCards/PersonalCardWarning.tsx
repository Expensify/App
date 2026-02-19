import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import HeaderPageLayout from '@components/HeaderPageLayout';
import {View} from 'react-native';
import Text from '@components/Text';
import Button from '@components/Button';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {isPolicyAdmin} from '@libs/ReportUtils';

function PersonalCardWarning() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardFeedsByPolicy} = useCardFeedsForDisplay();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const checkIfAtLeastOnePolicyWithAdminAccess = () => {
        for (const policyID of Object.keys(cardFeedsByPolicy)) {
            const isAdmin = isPolicyAdmin(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]);
            if (isAdmin) {
                return true;
            }
        }
        return false;
    };

    const isAdmin = checkIfAtLeastOnePolicyWithAdminAccess();

    return (
        <HeaderPageLayout
            onBackButtonPress={Navigation.goBack}
            title={translate('bankAccount.addBankAccount')}
            testID="PersonalCardWarning"
            footer={
                <>
                    <Button
                        large
                        text={'secondaryButtonText'}
                        testID="confirmation-secondary-button"
                        style={styles.mt3}
                        onPress={() => {}}
                    />
                    <Button
                        success
                        large
                        text={'buttonText'}
                        testID="confirmation-primary-button"
                        style={styles.mt3}
                        pressOnEnter
                        onPress={() => {}}
                    />
                </>
            }
            childrenContainerStyles={[styles.pt3, styles.gap6]}
            shouldShowOfflineIndicatorInWideScreen
        >
            <View style={[styles.flex1, styles.gap4, styles.mh5]}>
                <Text>{translate('lockAccountPage.compromisedDescription')}</Text>
                <Text>{translate('lockAccountPage.domainAdminsDescription')}</Text>
            </View>
        </HeaderPageLayout>
    );
}

export default PersonalCardWarning;
