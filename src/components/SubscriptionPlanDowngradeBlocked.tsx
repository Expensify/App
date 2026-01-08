import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import type {PrivateSubscription} from '@src/types/onyx';
import Button from './Button';
import FixedFooter from './FixedFooter';
import Text from './Text';

type SubscriptionPlanDowngradeBlockedProps = {
    privateSubscription: OnyxEntry<PrivateSubscription>;
    formattedSubscriptionEndDate: string;
    onClosePress: () => void;
};

function SubscriptionPlanDowngradeBlocked({privateSubscription, formattedSubscriptionEndDate, onClosePress}: SubscriptionPlanDowngradeBlockedProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isInvoicingPlanType = isSubscriptionTypeOfInvoicing(privateSubscription?.type);

    return (
        <View style={[styles.flexGrow1]}>
            <Text style={[styles.ph5, styles.pb5, styles.textNormalThemeText]}>
                {isInvoicingPlanType ? translate('workspace.common.youCantDowngradeInvoicing') : translate('subscription.subscriptionSize.youCantDowngrade')}
            </Text>
            {!isInvoicingPlanType && (
                <Text style={[styles.ph5, styles.textNormalThemeText]}>
                    {translate('subscription.subscriptionSize.youAlreadyCommitted', {
                        size: privateSubscription?.userCount ?? 0,
                        date: formattedSubscriptionEndDate,
                    })}
                </Text>
            )}
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    large
                    onPress={onClosePress}
                    text={translate('common.close')}
                />
            </FixedFooter>
        </View>
    );
}

export default SubscriptionPlanDowngradeBlocked;
