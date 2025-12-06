import React, {createContext, useEffect, useMemo, useState} from 'react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        showConfirmModal({
            title: translate('lockedAccount.title'),
            prompt: translate('lockedAccount.description'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            setIsModalOpen(false);
        });
    }, [isModalOpen, showConfirmModal, translate]);

    const contextValue = useMemo(
        () => ({
            isAccountLocked,
            showLockedAccountModal: () => setIsModalOpen(true),
        }),
        [isAccountLocked],
    );

    return <LockedAccountContext.Provider value={contextValue}>{children}</LockedAccountContext.Provider>;
}

LockedAccountModalProvider.displayName = 'LockedAccountModal';

export default LockedAccountModalProvider;
export {LockedAccountContext};
