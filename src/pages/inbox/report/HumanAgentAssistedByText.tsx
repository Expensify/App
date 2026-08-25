import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getHumanAgentFirstName} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type HumanAgentAssistedByTextProps = {
    /** The action whose human agent's first name drives the "assisted by" label. */
    action: OnyxEntry<OnyxTypes.ReportAction>;

    /** Typography style supplied by the system-message layout. */
    textStyle?: StyleProp<TextStyle>;
};

function HumanAgentAssistedByText({action, textStyle}: HumanAgentAssistedByTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [humanAgentName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (list: OnyxEntry<OnyxTypes.PersonalDetailsList>) => getHumanAgentFirstName(action, list),
    });
    return <Text style={[styles.chatDelegateMessage, textStyle]}>{translate('reportAction.assistedBy', humanAgentName ?? translate('reportAction.humanSupportAgent'))}</Text>;
}

export default HumanAgentAssistedByText;
