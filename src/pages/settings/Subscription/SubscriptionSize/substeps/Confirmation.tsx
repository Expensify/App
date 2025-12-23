import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SubscriptionPlanDowngradeBlocked from '@components/SubscriptionPlanDowngradeBlocked';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {formatSubscriptionEndDate, getNewSubscriptionRenewalDate} from '@pages/settings/Subscription/utils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

type ConfirmationProps = SubStepProps;

function Confirmation({onNext, isEditing}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const privateSubscription = usePrivateSubscription();
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT, {canBeMissing: true});
    const subscriptionRenewalDate = getNewSubscriptionRenewalDate();
    const subscriptionSizeDraft = subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[INPUT_IDS.SUBSCRIPTION_SIZE]) : 0;
    const subscriptionSize = subscriptionSizeDraft || (privateSubscription?.userCount ?? 0);

    const isTryingToIncreaseSubscriptionSize = subscriptionSizeDraft > (privateSubscription?.userCount ?? 0);
    const canChangeSubscriptionSize = (account?.canDowngrade ?? false) || (isTryingToIncreaseSubscriptionSize && isEditing);
    const formattedSubscriptionEndDate = formatSubscriptionEndDate(privateSubscription?.endDate);

    const onClosePress = () => {
        Navigation.goBack();
    };

    if (!canChangeSubscriptionSize) {
        return (
            <SubscriptionPlanDowngradeBlocked
                privateSubscription={privateSubscription}
                formattedSubscriptionEndDate={formattedSubscriptionEndDate}
                onClosePress={onClosePress}
            />
        );
    }

    return (
        <View style={[styles.flexGrow1]}>
            <Text style={[styles.ph5, styles.pb3]}>{translate('subscription.subscriptionSize.confirmDetails')}</Text>
            <MenuItemWithTopDescription
                interactive={false}
                description={translate('subscription.subscriptionSize.subscriptionSize')}
                title={translate('subscription.subscriptionSize.activeMembers', {size: subscriptionSize})}
            />
            <MenuItemWithTopDescription
                interactive={false}
                description={translate('subscription.subscriptionSize.subscriptionRenews')}
                title={subscriptionRenewalDate}
            />
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    large
                    onPress={onNext}
                    text={translate('common.save')}
                />
            </FixedFooter>
        </View>
    );
}

export default Confirmation;
