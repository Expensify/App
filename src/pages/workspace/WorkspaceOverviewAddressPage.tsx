import React, {useMemo} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getWorkspaceAddressStreetLines} from '@libs/WorkspacesSettingsUtils';
import AddressPage from '@pages/AddressPage';
import {updateAddress} from '@userActions/Policy/Policy';
import type ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

type WorkspaceOverviewAddressPagePolicyProps = WithPolicyProps;

type WorkspaceOverviewAddressPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_OVERVIEW_ADDRESS> &
    WorkspaceOverviewAddressPagePolicyProps;

function WorkspaceOverviewAddressPage({policy}: WorkspaceOverviewAddressPageProps) {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_OVERVIEW_ADDRESS.path);
    const address: Address = useMemo(() => {
        const tempAddress = policy?.address;
        const {streetLineOne, streetLineTwo} = getWorkspaceAddressStreetLines(tempAddress?.addressStreet, tempAddress?.addressStreet2);
        const result = {
            street: streetLineOne,
            street2: streetLineTwo,
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
            addressStreet: values.addressLine1?.trim() ?? '',
            addressStreet2: values.addressLine2?.trim() ?? '',
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
        Navigation.goBack(backPath);
    };

    return (
        <AddressPage
            backTo={backPath}
            address={address}
            isLoadingApp={false}
            updateAddress={updatePolicyAddress}
            title={translate('common.companyAddress')}
        />
    );
}

export default withPolicy(WorkspaceOverviewAddressPage);
