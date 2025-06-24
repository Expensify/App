import React, {createContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import AccountUtils from '@libs/AccountUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLink from './TextLink';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const delegatorEmail = currentUserDetails?.login ?? '';
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const isDelegateAccessRestricted = isActingAsDelegate && AccountUtils.isDelegateOnlySubmitter(account);

    const delegateNoAccessPrompt = (
        <Text>
            {translate('delegate.notAllowedMessageStart')}
            <TextLink href={CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}>{translate('delegate.notAllowedMessageHyperLinked')}</TextLink>
            {translate('delegate.notAllowedMessageEnd', {accountOwnerEmail: delegatorEmail})}
        </Text>
    );
    const contextValue = useMemo(
        () => ({
            isActingAsDelegate,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal: () => setIsModalOpen(true),
        }),
        [isActingAsDelegate, isDelegateAccessRestricted],
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

DelegateNoAccessModalProvider.displayName = 'DelegateNoAccessModalProvider';

export default DelegateNoAccessModalProvider;
export {DelegateNoAccessContext};
