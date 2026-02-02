import React, {createContext, useMemo} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type LockedAccountContextType = {
    showLockedAccountModal: () => void;
    isAccountLocked: boolean;
};

const LockedAccountContext = createContext<LockedAccountContextType>({
    showLockedAccountModal: () => {},
    isAccountLocked: false,
});

function LockedAccountModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [lockAccountDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS, {canBeMissing: true});
    const isAccountLocked = lockAccountDetails?.isLocked ?? false;

    const contextValue = useMemo(
        () => ({
            isAccountLocked,
            showLockedAccountModal: () => {
                showConfirmModal({
                    title: translate('lockedAccount.title'),
                    prompt: translate('lockedAccount.description'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                });
            },
        }),
        [isAccountLocked, showConfirmModal, translate],
    );

    return <LockedAccountContext.Provider value={contextValue}>{children}</LockedAccountContext.Provider>;
}

export default LockedAccountModalProvider;
export {LockedAccountContext};
