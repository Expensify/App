import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as LoginUtils from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GetPhysicalCardForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/GetPhysicalCardForm';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

type OnValidateResult = {
    phoneNumber?: string;
};

type GetPhysicalCardPhoneProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS>;

function GetPhysicalCardPhone({
    route: {
        params: {domain},
    },
}: GetPhysicalCardPhoneProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);

    const {phoneNumber = ''} = draftValues ?? {};

    const onValidate = (values: OnyxEntry<GetPhysicalCardForm>): OnValidateResult => {
        const {phoneNumber: phoneNumberToValidate = ''} = values ?? {};

        const errors: OnValidateResult = {};

        if (!LoginUtils.validateNumber(phoneNumberToValidate)) {
            errors.phoneNumber = translate('common.error.phoneNumber');
        } else if (!phoneNumberToValidate) {
            errors.phoneNumber = translate('common.error.fieldRequired');
        }

        return errors;
    };

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.phoneMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
            onValidate={onValidate}
        >
            <View style={styles.mh5}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.PHONE_NUMBER}
                    name={INPUT_IDS.PHONE_NUMBER}
                    label={translate('getPhysicalCard.phoneNumber')}
                    aria-label={translate('getPhysicalCard.phoneNumber')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={phoneNumber}
                    shouldSaveDraft
                />
            </View>
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardPhone.displayName = 'GetPhysicalCardPhone';

export default GetPhysicalCardPhone;
