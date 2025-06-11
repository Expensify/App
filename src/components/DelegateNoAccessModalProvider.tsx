import React, {createContext, useMemo, useState} from 'react';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLink from './TextLink';

type DelegateNoAccessContextType = {
    showDelegateNoAccessModal: () => void;
    isActingAsDelegate: boolean;
};

const DelegateNoAccessContext = createContext<DelegateNoAccessContextType>({
    showDelegateNoAccessModal: () => {},
    isActingAsDelegate: false,
});

function DelegateNoAccessModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const {delegatorEmail} = useDelegateUserDetails();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;

    const delegateNoAccessPrompt = (
        <Text>
            {translate('delegate.notAllowedMessageStart')}
            <TextLink href={CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}>{translate('delegate.notAllowedMessageHyperLinked')}</TextLink>
            {translate('delegate.notAllowedMessageEnd', {accountOwnerEmail: delegatorEmail ?? ''})}
        </Text>
    );
    const contextValue = useMemo(
        () => ({
            isActingAsDelegate,
            showDelegateNoAccessModal: () => setIsModalOpen(true),
        }),
        [isActingAsDelegate],
    );

    return (
        <DelegateNoAccessContext.Provider value={contextValue}>
            {children}
            <ConfirmModal
                isVisible={isModalOpen}
                onConfirm={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                title={translate('delegate.notAllowed')}
                prompt={delegateNoAccessPrompt}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </DelegateNoAccessContext.Provider>
    );
}

DelegateNoAccessModalProvider.displayName = 'DelegateNoAccessModal';

export default DelegateNoAccessModalProvider;
export {DelegateNoAccessContext};
