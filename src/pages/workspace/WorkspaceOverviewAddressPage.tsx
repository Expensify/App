import React, {useMemo} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AddressPage from '@pages/AddressPage';
import {updateAddress} from '@userActions/Policy/Policy';
import type ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

type WorkspaceOverviewAddressPagePolicyProps = WithPolicyProps;

type WorkspaceOverviewAddressPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ADDRESS> & WorkspaceOverviewAddressPagePolicyProps;

function WorkspaceOverviewAddressPage({policy, route}: WorkspaceOverviewAddressPageProps) {
    const {translate} = useLocalize();
    const backTo = route.params.backTo;
    const address: Address = useMemo(() => {
        const tempAddress = policy?.address;
        const result = {
            street: tempAddress?.addressStreet ?? '',
            city: tempAddress?.city?.trim() ?? '',
            state: tempAddress?.state?.trim() ?? '',
            zip: tempAddress?.zipCode?.trim().toUpperCase() ?? '',
            country: tempAddress?.country ?? '',
        };
        return result;
    }, [policy?.address]);

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

WorkspaceOverviewAddressPage.displayName = 'WorkspaceOverviewAddressPage';

export default withPolicy(WorkspaceOverviewAddressPage);
