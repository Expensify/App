import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getOriginalMessage, getRemovedFromApprovalChainMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {multiPersonalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetailsList, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type RemovedFromApprovalChainContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN>;
};

function submitterNamesSelector(submittersAccountIDs: number[] | undefined) {
    return (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
        return multiPersonalDetailsSelector(submittersAccountIDs)(personalDetailsList)?.map(({displayName, login}) => displayName ?? login ?? 'Unknown Submitter');
    };
}

function RemovedFromApprovalChainContent({action}: RemovedFromApprovalChainContentProps) {
    const {translate} = useLocalize();
    const [submitterNames] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: submitterNamesSelector(getOriginalMessage(action)?.submittersAccountIDs)});

    return <ReportActionItemBasicMessage message={getRemovedFromApprovalChainMessage(translate, submitterNames ?? [])} />;
}

export default RemovedFromApprovalChainContent;
