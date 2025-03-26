import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import AddressPage from '@pages/AddressPage';
import {updateAddress} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceAddressForTravelPageProps = PlatformStackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.WORKSPACE_ADDRESS>;

function WorkspaceAddressForTravelPage({route}: WorkspaceAddressForTravelPageProps) {
    const {translate} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const policy = usePolicy(activePolicyID);

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
        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(route.params.domain ?? CONST.TRAVEL.DEFAULT_DOMAIN), {forceReplace: true});
    };

    return (
        <AddressPage
            isLoadingApp={false}
            updateAddress={updatePolicyAddress}
            title={translate('common.companyAddress')}
        />
    );
}

WorkspaceAddressForTravelPage.displayName = 'WorkspaceAddressForTravelPage';

export default WorkspaceAddressForTravelPage;
