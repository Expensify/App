import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHumanAgentFirstName} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type HumanAgentAssistedByTextProps = {
    /** The action whose human agent's first name drives the "assisted by" label. */
    action: OnyxEntry<OnyxTypes.ReportAction>;
};

function HumanAgentAssistedByText({action}: HumanAgentAssistedByTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [humanAgentName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (list: OnyxEntry<OnyxTypes.PersonalDetailsList>) => getHumanAgentFirstName(action, list),
    });
    return <Text style={[styles.chatDelegateMessage]}>{translate('reportAction.assistedBy', humanAgentName ?? translate('reportAction.humanSupportAgent'))}</Text>;
}

export default HumanAgentAssistedByText;
