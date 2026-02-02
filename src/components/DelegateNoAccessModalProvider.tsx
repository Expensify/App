import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import RenderHTML from './RenderHTML';

type DelegateNoAccessContextType = {
    /** Whether the current user is acting as delegate */
    isActingAsDelegate: boolean;

    /** Whether the current user has restricted access as a submitter only delegate */
    isDelegateAccessRestricted: boolean;

    /** Function to show the delegate no access modal */
    showDelegateNoAccessModal: () => void;
};

const DelegateNoAccessContext = createContext<DelegateNoAccessContextType>({
    isActingAsDelegate: false,
    isDelegateAccessRestricted: false,
    showDelegateNoAccessModal: () => {},
});

function DelegateNoAccessModalProvider({children}: PropsWithChildren) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const delegatorEmail = currentUserDetails?.login ?? '';
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const isDelegateAccessRestricted = isActingAsDelegate && AccountUtils.isDelegateOnlySubmitter(account);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        showConfirmModal({
            title: translate('delegate.notAllowed'),
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('delegate.notAllowedMessage', delegatorEmail)} />
                </View>
            ),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            setIsModalOpen(false);
        });
    }, [isModalOpen, showConfirmModal, translate, styles.renderHTML, styles.flexRow, delegatorEmail]);

    const contextValue = useMemo(
        () => ({
            isActingAsDelegate,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal: () => setIsModalOpen(true),
        }),
        [isActingAsDelegate, isDelegateAccessRestricted],
    );

    return <DelegateNoAccessContext.Provider value={contextValue}>{children}</DelegateNoAccessContext.Provider>;
}

DelegateNoAccessModalProvider.displayName = 'DelegateNoAccessModalProvider';

export default DelegateNoAccessModalProvider;
export {DelegateNoAccessContext};
