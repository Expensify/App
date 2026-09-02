import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getNewSubscriptionRenewalDate} from '@pages/settings/Subscription/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

import React from 'react';
import {View} from 'react-native';

type ConfirmationProps = SubPageProps;

function Confirmation({onNext}: ConfirmationProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();
    const privateSubscription = usePrivateSubscription();
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT);
    const subscriptionRenewalDate = getNewSubscriptionRenewalDate(dateFnsLocale);
    const subscriptionSizeDraft = subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[INPUT_IDS.SUBSCRIPTION_SIZE]) : 0;
    const subscriptionSize = subscriptionSizeDraft || (privateSubscription?.userCount ?? 0);

    return (
        <View style={[styles.flexGrow1]}>
            <Text style={[styles.ph5, styles.pb3]}>{translate('subscription.subscriptionSize.confirmDetails')}</Text>
            <MenuItemField description={translate('subscription.subscriptionSize.subscriptionSize')}>
                <MenuItem.Title>{translate('subscription.subscriptionSize.activeMembers', subscriptionSize)}</MenuItem.Title>
            </MenuItemField>
            <MenuItemField description={translate('subscription.subscriptionSize.subscriptionRenews')}>
                {!!subscriptionRenewalDate && <MenuItem.Title>{subscriptionRenewalDate}</MenuItem.Title>}
            </MenuItemField>
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={onNext}
                >
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </FixedFooter>
        </View>
    );
}

export default Confirmation;
