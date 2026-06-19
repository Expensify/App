import React, {useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import AddressPage from '@pages/AddressPage';
import type {FormOnyxValues} from '@src/components/Form/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import {updateAddress as updateAddressPersonalDetails} from '@src/libs/actions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>, addresses: Address[]) {
    updateAddressPersonalDetails(
        addresses,
        values.addressLine1?.trim() ?? '',
        values.addressLine2?.trim() ?? '',
        values.city.trim(),
        values.state.trim(),
        values?.zipPostCode?.trim().toUpperCase() ?? '',
        values.country,
    );
}

function PersonalAddressPage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [defaultCountry, defaultCountryStatus] = useOnyx(ONYXKEYS.COUNTRY);
    // Find the first workspace using the homeAndOffice commuter-exclusion method so we can surface
    // a contextual note to the member explaining where this address is consumed. Multiple workspaces
    // may rely on it; we name the first one for brevity since the policy is identical for all.
    const [commuterHomeAndOfficePolicyName] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) =>
            Object.values(policies ?? {}).find(
                (policy) =>
                    policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE &&
                    policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            )?.name,
    });
    const isLoading = isLoadingOnyxValue(defaultCountryStatus);
    const address = useMemo(() => normalizeCountryCode(getCurrentAddress(privatePersonalDetails)) as Address, [privatePersonalDetails]);
    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'PersonalAddressPage',
        isLoading,
    };

    if (isLoading) {
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }
    return (
        <AddressPage
            defaultCountry={defaultCountry as Country}
            address={address}
            isLoadingApp={isLoadingApp}
            updateAddress={(values) => updateAddress(values, privatePersonalDetails?.addresses ?? [])}
            title={translate('privatePersonalDetails.homeAddress')}
            helperText={
                commuterHomeAndOfficePolicyName ? translate('privatePersonalDetails.commuterExclusionsNote', {workspaceName: commuterHomeAndOfficePolicyName}) : undefined
            }
        />
    );
}

export default PersonalAddressPage;
