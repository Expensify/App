import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {personalDetailsByLoginSelector, personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';

type DelegateOnBehalfOfTextFallbackProps = {
    /** Fallback login looked up in the personal-details map when the account ID is not yet hydrated. */
    fallbackLogin: string | undefined;
};

function DelegateOnBehalfOfTextFallback({fallbackLogin}: DelegateOnBehalfOfTextFallbackProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [detail] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_DETAILS_LIST_BY_LOGIN, {selector: personalDetailsByLoginSelector(fallbackLogin)});
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
    const [resolvedDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(mainAccountID ?? CONST.DEFAULT_NUMBER_ID)});

    if (!resolvedDetail?.login) {
        return <DelegateOnBehalfOfTextFallback fallbackLogin={fallbackLogin} />;
    }
    return <Text style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', resolvedDetail.displayName ?? '')}</Text>;
}

export default DelegateOnBehalfOfText;
