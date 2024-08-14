import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT);
    const subscriptionRenewalDate = getNewSubscriptionRenewalDate();
    const subscriptionSizeDraft = subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[INPUT_IDS.SUBSCRIPTION_SIZE]) : 0;
    const subscriptionSize = subscriptionSizeDraft || (privateSubscription?.userCount ?? 0);

    const isTryingToIncreaseSubscriptionSize = subscriptionSizeDraft > (privateSubscription?.userCount ?? 0);
    const canChangeSubscriptionSize = (account?.canDowngrade ?? false) || (isTryingToIncreaseSubscriptionSize && isEditing);
    const formattedSubscriptionEndDate = formatSubscriptionEndDate(privateSubscription?.endDate);

    const onClosePress = () => {
        Navigation.goBack();
    };

    return (
        <View style={[styles.flexGrow1]}>
            {canChangeSubscriptionSize ? (
                <>
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
                </>
            ) : (
                <>
                    <Text style={[styles.ph5, styles.pb5, styles.textNormalThemeText]}>{translate('subscription.subscriptionSize.youCantDowngrade')}</Text>
                    <Text style={[styles.ph5, styles.textNormalThemeText]}>
                        {translate('subscription.subscriptionSize.youAlreadyCommitted', {
                            size: privateSubscription?.userCount ?? 0,
                            date: formattedSubscriptionEndDate,
                        })}
                    </Text>
                </>
            )}
            <FixedFooter style={[styles.mtAuto]}>
                {canChangeSubscriptionSize ? (
                    <Button
                        success
                        large
                        onPress={onNext}
                        text={translate('common.save')}
                    />
                ) : (
                    <Button
                        success
                        large
                        onPress={onClosePress}
                        text={translate('common.close')}
                    />
                )}
            </FixedFooter>
        </View>
    );
}

Confirmation.displayName = 'ConfirmationStep';

export default Confirmation;
