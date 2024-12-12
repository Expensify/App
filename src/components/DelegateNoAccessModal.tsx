import React from 'react';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLink from './TextLink';

type DelegateNoAccessModalProps = {
    isNoDelegateAccessMenuVisible: boolean;
    onClose: () => void;
};

export default function DelegateNoAccessModal({isNoDelegateAccessMenuVisible = false, onClose}: DelegateNoAccessModalProps) {
    const {translate} = useLocalize();
    const {delegatorEmail} = useDelegateUserDetails();
    const noDelegateAccessPromptStart = translate('delegate.notAllowedMessageStart');
    const noDelegateAccessHyperLinked = translate('delegate.notAllowedMessageHyperLinked');
    const noDelegateAccessPromptEnd = translate('delegate.notAllowedMessageEnd', {accountOwnerEmail: delegatorEmail ?? ''});
    const delegateNoAccessPrompt = (
        <Text>
            {noDelegateAccessPromptStart}
            <TextLink href={CONST.DELEGATE_ROLE_HELPDOT_ARTICLE_LINK}>{noDelegateAccessHyperLinked}</TextLink>
            {noDelegateAccessPromptEnd}
        </Text>
    );

    return (
        <ConfirmModal
            isVisible={isNoDelegateAccessMenuVisible}
            onConfirm={onClose}
            onCancel={onClose}
            title={translate('delegate.notAllowed')}
            prompt={delegateNoAccessPrompt}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}
