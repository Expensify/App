import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type VacationDelegate from '@src/types/onyx/VacationDelegate';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns the vacation delegate errors worth showing, which means only those left behind once the change has settled.
 *
 * Auth answers a delegate who is missing from some of the vacationer's workspaces with a 305 policy diff warning, and
 * ships an `errors` payload in its onyxData even though the warning is a confirmation prompt rather than a failure.
 * That payload lands while the optimistic `pendingAction` is still set, so gating on it keeps the prompt from
 * flashing a red brick road. Every write that reports a real failure clears `pendingAction` alongside the errors,
 * which is what keeps genuine failures visible — a new one has to keep doing that.
 */
function getVacationDelegateErrors(vacationDelegate: OnyxEntry<VacationDelegate>): OnyxCommon.Errors | undefined {
    if (vacationDelegate?.pendingAction) {
        return undefined;
    }

    return vacationDelegate?.errors;
}

export default getVacationDelegateErrors;
