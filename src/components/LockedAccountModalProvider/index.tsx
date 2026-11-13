import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// This component is compiled by the React Compiler
/* eslint-disable react/jsx-no-constructed-context-values */
import React, {createContext, useContext} from 'react';

import type {LockedAccountActionsContextType, LockedAccountStateContextType} from './types';

import {defaultLockedAccountActionsContextValue, defaultLockedAccountStateContextValue} from './default';

const LockedAccountStateContext = createContext<LockedAccountStateContextType>(defaultLockedAccountStateContextValue);
const LockedAccountActionsContext = createContext<LockedAccountActionsContextType>(defaultLockedAccountActionsContextValue);

function LockedAccountModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [lockAccountDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS);
    const isAccountLocked = lockAccountDetails?.isLocked ?? false;

    const stateValue = {isAccountLocked};
    const actionsValue = {
        showLockedAccountModal: () => {
            showConfirmModal({
                title: translate('lockedAccount.title'),
                prompt: translate('lockedAccount.description'),
                confirmText: translate('unlockAccountPage.chatWithConcierge'),
                cancelText: translate('common.dismiss'),
                shouldShowCancelButton: true,
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    return;
                }
                Navigation.navigate(ROUTES.CONCIERGE);
            });
        },
    };

    return (
        <LockedAccountStateContext.Provider value={stateValue}>
            <LockedAccountActionsContext.Provider value={actionsValue}>{children}</LockedAccountActionsContext.Provider>
        </LockedAccountStateContext.Provider>
    );
}

function useLockedAccountState() {
    return useContext(LockedAccountStateContext);
}

function useLockedAccountActions() {
    return useContext(LockedAccountActionsContext);
}

export default LockedAccountModalProvider;
export {useLockedAccountState, useLockedAccountActions};
