import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as LoginUtils from '@libs/LoginUtils';
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

type GetPhysicalCardPhoneOnyxProps = {
    /** Draft values used by the get physical card form */
    draftValues: OnyxEntry<GetPhysicalCardForm>;
};

type GetPhysicalCardPhoneProps = GetPhysicalCardPhoneOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS>;

function GetPhysicalCardPhone({
    route: {
        params: {domain},
    },
    draftValues,
}: GetPhysicalCardPhoneProps) {
    const {translate} = useLocalize();

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
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardPhone.displayName = 'GetPhysicalCardPhone';

export default withOnyx<GetPhysicalCardPhoneProps, GetPhysicalCardPhoneOnyxProps>({
    draftValues: {
        key: ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT,
    },
})(GetPhysicalCardPhone);
