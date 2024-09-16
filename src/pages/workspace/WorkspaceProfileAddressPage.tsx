import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AddressPage from '@pages/AddressPage';
import {updateAddress} from '@userActions/Policy/Policy';
import type ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

type WorkspaceProfileAddressPagePolicyProps = WithPolicyProps;

type WorkspaceProfileAddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ADDRESS> & WorkspaceProfileAddressPagePolicyProps;

function WorkspaceProfileAddressPage({policy, route}: WorkspaceProfileAddressPageProps) {
    const {translate} = useLocalize();
    const backTo = route.params.backTo;
    const address: Address = useMemo(() => {
        const tempAddress = policy?.address;
        const [street1, street2] = (tempAddress?.addressStreet ?? '').split('\n');
        const result = {
            street: street1?.trim() ?? '',
            street2: street2?.trim() ?? '',
            city: tempAddress?.city?.trim() ?? '',
            state: tempAddress?.state?.trim() ?? '',
            zip: tempAddress?.zipCode?.trim().toUpperCase() ?? '',
            country: tempAddress?.country ?? '',
        };
        return result;
    }, [policy]);

    const updatePolicyAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        if (!policy) {
            return;
        }
        updateAddress(policy?.id, {
            addressStreet: `${values.addressLine1?.trim() ?? ''}\n${values.addressLine2?.trim() ?? ''}`,
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
        Navigation.goBack(backTo);
    };

    return (
        <AddressPage
            backTo={backTo}
            address={address}
            isLoadingApp={false}
            updateAddress={updatePolicyAddress}
            title={translate('common.companyAddress')}
        />
    );
}

WorkspaceProfileAddressPage.displayName = 'WorkspaceProfileAddressPage';

export default withPolicy(WorkspaceProfileAddressPage);
