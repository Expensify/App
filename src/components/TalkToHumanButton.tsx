import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';

import CONST from '@src/CONST';

import Button from './Button';

function TalkToHumanButton() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles']);
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();

    const label = translate('initialSettingsPage.talkToAHuman');

    return (
        <Button
            onPress={callFunctionIfActionIsAllowed(openSupportTicketOrConcierge)}
            isDisabled={isOffline}
            sentryLabel={CONST.SENTRY_LABEL.TALK_TO_HUMAN.BUTTON}
            accessibilityLabel={label}
        >
            <Button.Icon src={icons.ChatBubbles} />
            <Button.Text>{label}</Button.Text>
        </Button>
    );
}

export default TalkToHumanButton;
