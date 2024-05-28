import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getNewSubscriptionRenewalDate} from '@pages/settings/Subscription/SubscriptionSize/utils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SubscriptionSizeForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

type ConfirmationOnyxProps = {
    /** The draft values from subscription size form */
    subscriptionSizeForm: OnyxEntry<SubscriptionSizeForm>;
};
type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

function Confirmation({subscriptionSizeForm, onNext}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const subscriptionRenewalDate = getNewSubscriptionRenewalDate();

    // TODO remove that in next phase and replace with canDowngrade from account
    // we also have to check if the amount of active members is less than the current amount of active members and if acccount?.canDowngrade is true
    // if so then we can't downgrade
    const CAN_DOWNGRADE = true;
    // TODO replace with real data once BE is ready
    const SUBSCRIPTION_UNTIL = subscriptionRenewalDate;

    return (
        <View style={[styles.flexGrow1]}>
            {CAN_DOWNGRADE ? (
                <>
                    <Text style={[styles.ph5, styles.pb3]}>{translate('subscriptionSize.confirmDetails')}</Text>
                    <MenuItemWithTopDescription
                        interactive={false}
                        description={translate('subscriptionSize.subscriptionSize')}
                        title={translate('subscriptionSize.activeMembers', {size: subscriptionSizeForm ? subscriptionSizeForm[INPUT_IDS.SUBSCRIPTION_SIZE] : 0})}
                    />
                    <MenuItemWithTopDescription
                        interactive={false}
                        description={translate('subscriptionSize.subscriptionRenews')}
                        title={subscriptionRenewalDate}
                    />
                </>
            ) : (
                <>
                    <Text style={[styles.ph5, styles.pb5, styles.textNormalThemeText]}>{translate('subscriptionSize.youCantDowngrade')}</Text>
                    <Text style={[styles.ph5, styles.textLabel]}>
                        {translate('subscriptionSize.youAlreadyCommitted', {size: subscriptionSizeForm ? subscriptionSizeForm[INPUT_IDS.SUBSCRIPTION_SIZE] : 0, date: SUBSCRIPTION_UNTIL})}
                    </Text>
                </>
            )}
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    isDisabled={isOffline}
                    success
                    large
                    onPress={onNext}
                    text={translate(CAN_DOWNGRADE ? 'common.save' : 'common.close')}
                />
            </FixedFooter>
        </View>
    );
}

Confirmation.displayName = 'ConfirmationStep';

export default withOnyx<ConfirmationProps, ConfirmationOnyxProps>({
    subscriptionSizeForm: {
        key: ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT,
    },
})(Confirmation);
