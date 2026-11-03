import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type DelegateOnBehalfOfTextFallbackProps = {
    /** Fallback login looked up in the personal-details map when the account ID is not yet hydrated. */
    fallbackLogin: string | undefined;
};

function DelegateOnBehalfOfTextFallback({fallbackLogin}: DelegateOnBehalfOfTextFallbackProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const detail = usePersonalDetailByLogin(fallbackLogin);
    return <Text style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', detail?.displayName ?? '')}</Text>;
}

type DelegateOnBehalfOfTextProps = {
    /** The account ID whose login drives the "on behalf of" name. */
    mainAccountID: number | undefined;

    /** Fallback login if the account is not yet present in personal details. */
    fallbackLogin: string | undefined;
};

function DelegateOnBehalfOfText({mainAccountID, fallbackLogin}: DelegateOnBehalfOfTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [resolvedDetail] = usePersonalDetail(mainAccountID);

    if (!resolvedDetail?.login) {
        return <DelegateOnBehalfOfTextFallback fallbackLogin={fallbackLogin} />;
    }
    return <Text style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', resolvedDetail.displayName ?? '')}</Text>;
}

export default DelegateOnBehalfOfText;
