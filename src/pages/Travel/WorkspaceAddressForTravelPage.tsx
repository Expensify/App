import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import AddressPage from '@pages/AddressPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updateAddress} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceAddressForTravelPageProps = PlatformStackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.WORKSPACE_ADDRESS>;

function WorkspaceAddressForTravelPage({route}: WorkspaceAddressForTravelPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});

    const updatePolicyAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        if (!policy) {
            return;
        }

        // Always validate OTP first before allowing address submission
        if (!isUserValidated) {
            // After OTP validation, redirect back to this address page
            const currentRoute = ROUTES.TRAVEL_WORKSPACE_ADDRESS.getRoute(route.params.domain, policyID, route.params.backTo);
            setTravelProvisioningNextStep(currentRoute);
            Navigation.navigate(ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(route.params.domain, policyID));
            return;
        }

        updateAddress(policy?.id, {
            addressStreet: `${values.addressLine1?.trim() ?? ''}\n${values.addressLine2?.trim() ?? ''}`,
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(route.params.domain ?? CONST.TRAVEL.DEFAULT_DOMAIN, policyID), {forceReplace: true});
    };

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <AddressPage
                isLoadingApp={false}
                updateAddress={updatePolicyAddress}
                title={translate('common.companyAddress')}
                backTo={route.params.backTo}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceAddressForTravelPage;
