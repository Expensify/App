import React, {useMemo} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {findSelfDMReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from '@hooks/useOnyx';
import BaseRequestStepWorkspace from './BaseRequestStepWorkspace';

type IOURequestStepPerDiemWorkspaceProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepPerDiemWorkspace({route, navigation}: IOURequestStepPerDiemWorkspaceProps) {
    const {
        params: {action, iouType, transactionID},
    } = route;
    const {accountID} = useCurrentUserPersonalDetails();
    const selfDMReportID = useMemo(() => findSelfDMReportID(), []);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {canBeMissing: true});

    return (
        <BaseRequestStepWorkspace
            route={route}
            navigation={navigation}
            getPolicies={getActivePoliciesWithExpenseChatAndPerDiemEnabled}
            onSelectWorkspace={(policy) => {
                const policyExpenseReportID = getPolicyExpenseChat(accountID, policy?.id)?.reportID;
                if (!policyExpenseReportID) {
                    return;
                }
                const perDiemUnit = getPerDiemCustomUnit(policy);
                if (iouType === CONST.IOU.TYPE.TRACK) {
                    setMoneyRequestParticipantsFromReport(transactionID, selfDMReport, accountID, false);
                } else {
                    setMoneyRequestParticipants(transactionID, [
                        {
                            selected: true,
                            accountID: 0,
                            isPolicyExpenseChat: true,
                            reportID: policyExpenseReportID,
                            policyID: policy?.id,
                        },
                    ]);
                }
                setCustomUnitID(transactionID, perDiemUnit?.customUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
                setMoneyRequestCategory(transactionID, perDiemUnit?.defaultCategory ?? '', undefined);
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, policyExpenseReportID));
            }}
        />
    );
}

export default IOURequestStepPerDiemWorkspace;
