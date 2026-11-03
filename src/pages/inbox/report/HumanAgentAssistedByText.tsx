import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {getHumanAgentAccountIDFromReportAction} from '@libs/ReportActionsUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {firstNameSelector} from '@selectors/PersonalDetails';
import React from 'react';

type HumanAgentAssistedByTextProps = {
    /** The action whose human agent's first name drives the "assisted by" label. */
    action: OnyxEntry<OnyxTypes.ReportAction>;
};

function HumanAgentAssistedByText({action}: HumanAgentAssistedByTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [humanAgentName] = usePersonalDetail(getHumanAgentAccountIDFromReportAction(action), firstNameSelector);
    return <Text style={[styles.chatDelegateMessage]}>{translate('reportAction.assistedBy', humanAgentName ?? translate('reportAction.humanSupportAgent'))}</Text>;
}

export default HumanAgentAssistedByText;
