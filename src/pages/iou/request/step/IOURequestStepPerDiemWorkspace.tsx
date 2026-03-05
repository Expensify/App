import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {findSelfDMReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {setTransactionReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseRequestStepWorkspace from './BaseRequestStepWorkspace';

type IOURequestStepPerDiemWorkspaceProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepPerDiemWorkspace({route, navigation}: IOURequestStepPerDiemWorkspaceProps) {
    const {
        params: {action, iouType, transactionID},
    } = route;
    const {accountID} = useCurrentUserPersonalDetails();
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();

    return (
        <BaseRequestStepWorkspace
            route={route}
            navigation={navigation}
            getPolicies={getActivePoliciesWithExpenseChatAndPerDiemEnabled}
            onSelectWorkspace={(policy) => {
                const {targetReport, targetIouType, transactionReportID} = getInitialPerDiemTargetReport(
                    getPolicyExpenseChat(accountID, policy?.id),
                    selfDMReport,
                    iouType,
                    defaultExpensePolicy,
                    personalPolicy,
                );

                if (!targetReport) {
                    return;
                }

                const perDiemUnit = getPerDiemCustomUnit(policy);
                if (!perDiemUnit) {
                    return;
                }

                setTransactionReport(transactionID, {reportID: transactionReportID}, true);
                if (targetIouType === CONST.IOU.TYPE.TRACK) {
                    setMoneyRequestParticipantsFromReport(transactionID, targetReport, accountID, false);
                } else {
                    setMoneyRequestParticipants(transactionID, [
                        {
                            selected: true,
                            accountID: 0,
                            isPolicyExpenseChat: true,
                            reportID: targetReport.reportID,
                            policyID: policy?.id,
                        },
                    ]);
                }
                setCustomUnitID(transactionID, perDiemUnit?.customUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
                setMoneyRequestCategory(transactionID, perDiemUnit?.defaultCategory ?? '', undefined);
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, targetIouType, transactionID, targetReport.reportID));
            }}
        />
    );
}

export default IOURequestStepPerDiemWorkspace;
