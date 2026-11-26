import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import {useAddressFields} from './AddressFieldsProvider';

type AddressCountrySelectorProps = {
    /** Whether the country can be changed, or only shown */
    shouldAllowChange?: boolean;
};

/** The country of an address, picked on a page of its own. A new country clears the state, which belongs to the old one */
function AddressCountrySelector({shouldAllowChange = true}: AddressCountrySelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, shouldSaveDraft, changeCountry, forwardedFSClass} = useAddressFields();

    return (
        <View style={[styles.mt3, styles.mhn5]}>
            <InputWrapper
                InputComponent={PushRowWithModal}
                inputID={inputKeys?.country ?? 'country'}
                shouldSaveDraft={shouldSaveDraft}
                optionsList={CONST.ALL_COUNTRIES}
                description={translate('common.country')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                value={values?.country}
                defaultValue={defaultValues?.country}
                // The form also passes the input key, which changeCountry would take as the picked address
                onValueChange={(country) => changeCountry(country)}
                stateInputIDToReset={inputKeys.state ?? 'stateInput'}
                shouldAllowChange={shouldAllowChange}
                forwardedFSClass={forwardedFSClass}
            />
        </View>
    );
}

export default AddressCountrySelector;
