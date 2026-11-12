/**
 * Starts a Digits connection. It mounts for one Connect press and makes sure the workspace is in USD, then either
 * offers to copy the Digits connection of another workspace or opens the Digits sign-in.
 */
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';

import Navigation from '@libs/Navigation/Navigation';

import useStartDigitsOAuth from '@pages/workspace/accounting/digits/useStartDigitsOAuth';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

import type {ConnectToDigitsFlowProps} from './types';

// The flow stays mounted after it opens the sign-in, so it only subscribes to the two values it reads, not the whole policy
function connectPrerequisitesSelector(policy: OnyxEntry<Policy>) {
    return {outputCurrency: policy?.outputCurrency, isConnectedToDigits: !!policy?.connections?.digits};
}

function ConnectToDigitsFlow({policyID}: ConnectToDigitsFlowProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [connectPrerequisites] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: connectPrerequisitesSelector});
    const hasReusablePoliciesConnectedToDigits = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.DIGITS, policyID);
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policyID);
    const startDigitsOAuth = useStartDigitsOAuth();
    const hasStartedRef = useRef(false);

    const promptCurrencyChange = async () => {
        // An open or partially set up bank account blocks the currency page, so only offer the change when it can be completed
        const result = await showConfirmModal({
            title: translate('workspace.digits.updateCurrencyTitle'),
            prompt: translate('workspace.digits.updateCurrencyPrompt'),
            confirmText: translate(shouldBlockCurrencyChange ? 'common.buttonConfirm' : 'workspace.bankAccount.updateWorkspaceCurrency'),
            cancelText: shouldBlockCurrencyChange ? undefined : translate('common.cancel'),
            shouldShowCancelButton: !shouldBlockCurrencyChange,
        });
        if (shouldBlockCurrencyChange || result.action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));
    };

    useEffect(() => {
        // Each step opens a tab, a modal or a page, so a second run (Strict Mode replays mount effects) would repeat it.
        // A ref rather than a module flag, because every Connect press mounts a fresh flow that has to run again.
        if (hasStartedRef.current) {
            return;
        }
        hasStartedRef.current = true;

        // Digits only supports companies that operate in USD, so a workspace in another currency has to change it first
        if (connectPrerequisites?.outputCurrency !== CONST.CURRENCY.USD) {
            promptCurrencyChange();
            return;
        }

        // "Enter your credentials" reruns the sign-in for the current connection, so only a new connection offers to copy one
        if (hasReusablePoliciesConnectedToDigits && !connectPrerequisites?.isConnectedToDigits) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }

        // On web the sign-in opens in a new tab, so it has to open here, within the connect press's user-gesture window
        startDigitsOAuth(policyID);
        // This needs to run once as the flow either opens the sign-in or navigates away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToDigitsFlow;
