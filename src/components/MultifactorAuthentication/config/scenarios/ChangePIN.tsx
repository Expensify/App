import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import SuccessScreenBase from '@components/MultifactorAuthentication/components/OutcomeScreen/SuccessScreen/SuccessScreenBase';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import {changePINForCard} from '@libs/actions/MultifactorAuthentication';
import variables from '@styles/variables';
import CONST from '@src/CONST';

/**
 * Payload type for the CHANGE_PIN scenario.
 * Contains the new PIN and cardID for the card whose PIN is being changed.
 */
type Payload = {
    pin: string;
    cardID: string;
};

const ClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.changePin.didNotChange',
    },
    'ClientFailureScreen',
);

const ServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        subtitle: 'multifactorAuthentication.changePin.didNotChange',
    },
    'ServerFailureScreen',
);

/**
 * Shows the offline-market ATM prompt when the card requires offline PIN verification,
 * otherwise shows the standard "PIN changed" confirmation.
 */
function ChangePINSuccessScreen() {
    const {payload} = useMultifactorAuthenticationState();
    const cardList = useNonPersonalCardList();
    const typedPayload = payload as Payload | undefined;
    const card = typedPayload?.cardID ? cardList?.[typedPayload.cardID] : undefined;

    if (card?.isOfflinePINMarket) {
        return (
            <SuccessScreenBase
                headerTitle="cardPage.pinChangedHeader"
                illustration="MagicCode"
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title="cardPage.changePinATMTitle"
                subtitle="cardPage.changePinATMDescription"
            />
        );
    }

    return (
        <SuccessScreenBase
            headerTitle="cardPage.pinChangedHeader"
            illustration="Fireworks"
            iconWidth={variables.openPadlockWidth}
            iconHeight={variables.openPadlockHeight}
            title="cardPage.pinChanged"
            subtitle="cardPage.pinChangedDescription"
        />
    );
}

ChangePINSuccessScreen.displayName = 'ChangePINSuccessScreen';

/**
 * Configuration for the CHANGE_PIN multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder changes the PIN of their physical card.
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: changePINForCard,
    successScreen: <ChangePINSuccessScreen />,
    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
