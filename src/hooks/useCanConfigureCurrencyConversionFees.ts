import {getReimbursementChoice} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import usePermissions from './usePermissions';

/**
 * Whether the currency conversion cost settings are available for a workspace. The cost only arises when
 * the workspace reimburses through Expensify, so every surface that exposes these settings gates on this.
 *
 * `reimbursementChoice` is a stored preference that is only recomputed when the Workflows > Payments toggle changes,
 * so it stays `reimburseYes` after the bank account is disconnected. The bank account has to be checked separately.
 */
function useCanConfigureCurrencyConversionFees(policy: OnyxEntry<Policy>): boolean {
    const {isBetaEnabled} = usePermissions();

    return (
        isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENT_FX) && getReimbursementChoice(policy) === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES && !!policy?.achAccount?.bankAccountID
    );
}

export default useCanConfigureCurrencyConversionFees;
