import React, {createContext, useMemo, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

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
    const [lockAccountDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS, {canBeMissing: true});
    const isAccountLocked = lockAccountDetails?.isLocked ?? false;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const contextValue = useMemo(
        () => ({
            isAccountLocked,
            showLockedAccountModal: () => setIsModalOpen(true),
        }),
        [isAccountLocked],
    );

    return (
        <LockedAccountContext.Provider value={contextValue}>
            {children}
            <ConfirmModal
                isVisible={isModalOpen}
                onConfirm={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                title={translate('lockedAccount.title')}
                prompt={translate('lockedAccount.description')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </LockedAccountContext.Provider>
    );
}

export default LockedAccountModalProvider;
export {LockedAccountContext};
