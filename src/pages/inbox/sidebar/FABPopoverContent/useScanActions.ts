import {useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getWorkspaceChats} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import Tab from '@userActions/Tab';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useRedirectToExpensifyClassic from './useRedirectToExpensifyClassic';

function useScanActions() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);
    const workspaceChatsSelector = (reports: OnyxCollection<OnyxTypes.Report>) => getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports);
    const [policyChats = getEmptyArray<OnyxTypes.Report>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: workspaceChatsSelector});

    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    // useState lazy initializer generates the ID once on mount and keeps it stable across renders
    const [reportID] = useState(() => generateReportID());

    const policyChatForActivePolicy: OnyxTypes.Report =
        !isEmptyObject(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && policyChats.length > 0 ? (policyChats.at(0) ?? ({} as OnyxTypes.Report)) : ({} as OnyxTypes.Report);

    const startScan = () => {
        interceptAnonymousUser(() => {
            if (shouldRedirectToExpensifyClassic) {
                showRedirectToExpensifyClassicModal();
                return;
            }
            startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, CONST.IOU.REQUEST_TYPE.SCAN, false, undefined, allTransactionDrafts, true);
        });
    };

    const policyChatPolicyID = policyChatForActivePolicy?.policyID;
    const policyChatReportID = policyChatForActivePolicy?.reportID;

    const startQuickScan = () => {
        interceptAnonymousUser(() => {
            if (policyChatPolicyID && shouldRestrictUserBillableActions(policyChatPolicyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatPolicyID));
                return;
            }

            const quickActionReportID = policyChatReportID ?? reportID;
            Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
            startSpan(CONST.TELEMETRY.SPAN_SCAN_SHORTCUT, {
                name: CONST.TELEMETRY.SPAN_SCAN_SHORTCUT,
                op: CONST.TELEMETRY.SPAN_SCAN_SHORTCUT,
            });
            startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatReportID, undefined, allTransactionDrafts, true);
        });
    };

    return {startScan, startQuickScan};
}

export default useScanActions;
