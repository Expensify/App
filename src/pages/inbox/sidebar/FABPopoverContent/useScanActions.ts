import {useCallback, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getWorkspaceChats} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Tab from '@userActions/Tab';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useRedirectToExpensifyClassic from './useRedirectToExpensifyClassic';

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

function useScanActions() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const workspaceChatsSelector = useCallback(
        (reports: OnyxCollection<OnyxTypes.Report>) => getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports),
        [activePolicyID, session?.accountID],
    );
    const [policyChats = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: workspaceChatsSelector, canBeMissing: true});

    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    const reportID = useMemo(() => generateReportID(), []);

    const policyChatForActivePolicy = useMemo(() => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return {} as OnyxTypes.Report;
        }
        return policyChats.length > 0 ? policyChats.at(0) : ({} as OnyxTypes.Report);
    }, [activePolicy, policyChats]);

    const startScan = useCallback(() => {
        interceptAnonymousUser(() => {
            if (shouldRedirectToExpensifyClassic) {
                showRedirectToExpensifyClassicModal();
                return;
            }
            startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, CONST.IOU.REQUEST_TYPE.SCAN, false, undefined, allTransactionDrafts, true);
        });
    }, [shouldRedirectToExpensifyClassic, allTransactionDrafts, reportID, showRedirectToExpensifyClassicModal]);

    const policyChatPolicyID = policyChatForActivePolicy?.policyID;
    const policyChatReportID = policyChatForActivePolicy?.reportID;

    const startQuickScan = useCallback(() => {
        interceptAnonymousUser(() => {
            if (policyChatPolicyID && shouldRestrictUserBillableActions(policyChatPolicyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatPolicyID));
                return;
            }

            const quickActionReportID = policyChatReportID ?? reportID;
            Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
            startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatReportID, undefined, allTransactionDrafts, true);
        });
    }, [policyChatPolicyID, policyChatReportID, reportID, allTransactionDrafts]);

    return {startScan, startQuickScan, reportID, activePolicyID};
}

export default useScanActions;
