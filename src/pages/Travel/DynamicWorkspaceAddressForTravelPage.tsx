import type {FormOnyxValues} from '@components/Form/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import AddressPage from '@pages/AddressPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {updateAddress} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';

type DynamicWorkspaceAddressForTravelPageProps = PlatformStackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.WORKSPACE_ADDRESS>;

function DynamicWorkspaceAddressForTravelPage({route}: DynamicWorkspaceAddressForTravelPageProps) {
    const {translate} = useLocalize();
    const {policyID, domain} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_WORKSPACE_ADDRESS.path);
    const policy = usePolicy(policyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });

    const updatePolicyAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        if (!policy) {
            return;
        }

        // Always validate OTP first before allowing address submission
        if (!isUserValidated) {
            // After OTP validation, redirect back to this address page
            const currentRoute = createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, policyID));
            setTravelProvisioningNextStep(currentRoute);
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(domain, policyID)));
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
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_TCS.getRoute(domain ?? CONST.TRAVEL.DEFAULT_DOMAIN, policyID)), {forceReplace: true});
    };

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <AddressPage
                isLoadingApp={false}
                updateAddress={updatePolicyAddress}
                title={translate('common.companyAddress')}
                backTo={backPath}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicWorkspaceAddressForTravelPage;
