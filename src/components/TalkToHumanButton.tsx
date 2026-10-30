/** Opens a support ticket from the Concierge header. */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

import Button from './Button';
import ButtonDisabledWhenOffline from './Button/composed/ButtonDisabledWhenOffline';

function TalkToHumanButton() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles']);
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();

    const label = translate('initialSettingsPage.talkToAHuman');

    return (
        <ButtonDisabledWhenOffline
            onPress={callFunctionIfActionIsAllowed(openSupportTicketOrConcierge, false, session)}
            sentryLabel={CONST.SENTRY_LABEL.TALK_TO_HUMAN.BUTTON}
            accessibilityLabel={label}
        >
            <Button.Icon src={icons.ChatBubbles} />
            <Button.Text>{label}</Button.Text>
        </ButtonDisabledWhenOffline>
    );
}

export default TalkToHumanButton;
