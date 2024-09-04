import React from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLink from './TextLink';

type DelegateNoAccessModalProps = {
    isNoDelegateAccessMenuVisible: boolean;
    onConfirm: () => void;
    delegatorEmail: string;
};

export default function DelegateNoAccessModal({isNoDelegateAccessMenuVisible = false, onConfirm, delegatorEmail = ''}: DelegateNoAccessModalProps) {
    const {translate} = useLocalize();
    const basicnoDelegateAccessPromptStart = translate('delegate.notAllowedMessageStart', {accountOwnerEmail: delegatorEmail});
    const basicnoDelegateAccessHyperLinked = translate('delegate.notAllowedMessageHyperLinked');
    const basicnoDelegateAccessPromptEnd = translate('delegate.notAllowedMessageEnd');

    const delegateNoAccessPrompt = (
        <Text>
            {basicnoDelegateAccessPromptStart}
            <TextLink href={CONST.DELEGATE_ROLE_HELPDOT_ARTICLE_LINK}>{basicnoDelegateAccessHyperLinked}</TextLink>
            {basicnoDelegateAccessPromptEnd}
        </Text>
    );

    return (
        <ConfirmModal
            isVisible={isNoDelegateAccessMenuVisible}
            onConfirm={onConfirm}
            title={translate('delegate.notAllowed')}
            prompt={delegateNoAccessPrompt}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}