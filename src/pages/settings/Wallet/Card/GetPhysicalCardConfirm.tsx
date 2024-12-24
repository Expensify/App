import React from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const goToGetPhysicalCardName = (domain: string) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

const goToGetPhysicalCardPhone = (domain: string) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

const goToGetPhysicalCardAddress = (domain: string) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

type GetPhysicalCardConfirmProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM>;

function GetPhysicalCardConfirm({
    route: {
        params: {domain},
    },
}: GetPhysicalCardConfirmProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);

    const {addressLine1, addressLine2, city = '', state = '', zipPostCode = '', country = '', phoneNumber = '', legalFirstName = '', legalLastName = ''} = draftValues ?? {};

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.confirmMessage')}
            isConfirmation
            submitButtonText={translate('getPhysicalCard.shipCard')}
            title={translate('getPhysicalCard.header')}
        >
            <Text style={[styles.mb5, styles.mh5]}>{translate('getPhysicalCard.estimatedDeliveryMessage')}</Text>
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.legalName')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardName(domain)}
                shouldShowRightIcon
                title={`${legalFirstName} ${legalLastName}`}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.phoneNumber')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardPhone(domain)}
                shouldShowRightIcon
                title={phoneNumber}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.address')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardAddress(domain)}
                shouldShowRightIcon
                title={PersonalDetailsUtils.getFormattedAddress({
                    addresses: [
                        {
                            street: PersonalDetailsUtils.getFormattedStreet(addressLine1, addressLine2),
                            city,
                            state,
                            zip: zipPostCode,
                            country,
                        },
                    ],
                })}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardConfirm.displayName = 'GetPhysicalCardConfirm';

export default GetPhysicalCardConfirm;
