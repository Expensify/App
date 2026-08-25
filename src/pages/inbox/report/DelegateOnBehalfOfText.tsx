import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, TextStyle} from 'react-native';

import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';

type DelegateOnBehalfOfTextFallbackProps = {
    /** Fallback login looked up in the personal-details map when the account ID is not yet hydrated. */
    fallbackLogin: string | undefined;

    /** Typography style supplied by the system-message layout. */
    textStyle?: StyleProp<TextStyle>;
};

function DelegateOnBehalfOfTextFallback({fallbackLogin, textStyle}: DelegateOnBehalfOfTextFallbackProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const detail = usePersonalDetailByLogin(fallbackLogin);
    return <Text style={[styles.chatDelegateMessage, textStyle]}>{translate('delegate.onBehalfOfMessage', detail?.displayName ?? '')}</Text>;
}

type DelegateOnBehalfOfTextProps = {
    /** The account ID whose login drives the "on behalf of" name. */
    mainAccountID: number | undefined;

    /** Fallback login if the account is not yet present in personal details. */
    fallbackLogin: string | undefined;

    /** Typography style supplied by the system-message layout. */
    textStyle?: StyleProp<TextStyle>;
};

function DelegateOnBehalfOfText({mainAccountID, fallbackLogin, textStyle}: DelegateOnBehalfOfTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [resolvedDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(mainAccountID ?? CONST.DEFAULT_NUMBER_ID),
    });

    if (!resolvedDetail?.login) {
        return (
            <DelegateOnBehalfOfTextFallback
                fallbackLogin={fallbackLogin}
                textStyle={textStyle}
            />
        );
    }
    return <Text style={[styles.chatDelegateMessage, textStyle]}>{translate('delegate.onBehalfOfMessage', resolvedDetail.displayName ?? '')}</Text>;
}

export default DelegateOnBehalfOfText;
