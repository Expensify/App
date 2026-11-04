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

import {useEffect, useRef} from 'react';

import type {ConnectToDigitsFlowProps} from './types';

function ConnectToDigitsFlow({policyID}: ConnectToDigitsFlowProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
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
        if (policy?.outputCurrency !== CONST.CURRENCY.USD) {
            promptCurrencyChange();
            return;
        }

        // "Enter your credentials" reruns the sign-in for the current connection, so only a new connection offers to copy one
        if (hasReusablePoliciesConnectedToDigits && !policy?.connections?.digits) {
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
