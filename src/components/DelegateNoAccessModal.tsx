import React from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLink from './TextLink';

type DelegateNoAccessModalProps = {
    isNoDelegateAccessMenuVisible: boolean;
    onClose: () => void;
    delegatorEmail: string;
};

export default function DelegateNoAccessModal({isNoDelegateAccessMenuVisible = false, onClose, delegatorEmail = ''}: DelegateNoAccessModalProps) {
    const {translate} = useLocalize();
    const noDelegateAccessPromptStart = translate('delegate.notAllowedMessageStart', {accountOwnerEmail: delegatorEmail});
    const noDelegateAccessHyperLinked = translate('delegate.notAllowedMessageHyperLinked');
    const noDelegateAccessPromptEnd = translate('delegate.notAllowedMessageEnd');

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
