import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GetPhysicalCardForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/GetPhysicalCardForm';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

type OnValidateResult = {
    legalFirstName?: string;
    legalLastName?: string;
};

type GetPhysicalCardNameProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME>;

function GetPhysicalCardName({
    route: {
        params: {domain},
    },
}: GetPhysicalCardNameProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);

    const {legalFirstName = '', legalLastName = ''} = draftValues ?? {};

    const onValidate = (values: OnyxEntry<GetPhysicalCardForm>): OnValidateResult => {
        const errors: OnValidateResult = {};

        if (values?.legalFirstName && !ValidationUtils.isValidLegalName(values.legalFirstName)) {
            errors.legalFirstName = translate('privatePersonalDetails.error.hasInvalidCharacter');
        } else if (!values?.legalFirstName) {
            errors.legalFirstName = translate('common.error.fieldRequired');
        }

        if (values?.legalLastName && !ValidationUtils.isValidLegalName(values.legalLastName)) {
            errors.legalLastName = translate('privatePersonalDetails.error.hasInvalidCharacter');
        } else if (!values?.legalLastName) {
            errors.legalLastName = translate('common.error.fieldRequired');
        }

        return errors;
    };

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.nameMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
            onValidate={onValidate}
        >
            <View style={styles.mh5}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                    name={INPUT_IDS.LEGAL_FIRST_NAME}
                    label={translate('getPhysicalCard.legalFirstName')}
                    aria-label={translate('getPhysicalCard.legalFirstName')}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="words"
                    defaultValue={legalFirstName}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_LAST_NAME}
                    name={INPUT_IDS.LEGAL_LAST_NAME}
                    label={translate('getPhysicalCard.legalLastName')}
                    aria-label={translate('getPhysicalCard.legalLastName')}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="words"
                    defaultValue={legalLastName}
                    containerStyles={styles.mt5}
                    shouldSaveDraft
                />
            </View>
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardName.displayName = 'GetPhysicalCardName';

export default GetPhysicalCardName;
