import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

export default function delegateRestrictedAccessPromptText(email: string) {
    const {translate} = useLocalize();
    const basicnoDelegateAccessPromptStart = translate('delegate.notAllowedMessageStart', {accountOwnerEmail: email});
    const basicnoDelegateAccessHyperLinked = translate('delegate.notAllowedMessageHyperLinked');
    const basicnoDelegateAccessPromptEnd = translate('delegate.notAllowedMessageEnd');

    const noDelegateAccessPromp = (
        <Text>
            {basicnoDelegateAccessPromptStart}
            <TextLink href={CONST.DELEGATE_ROLE_HELPDOT_ARTICLE_LINK}>{basicnoDelegateAccessHyperLinked}</TextLink>
            {basicnoDelegateAccessPromptEnd}
        </Text>
    );

    return noDelegateAccessPromp;
}
