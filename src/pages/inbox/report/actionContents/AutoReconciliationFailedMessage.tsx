/**
 * Renders an AUTO_RECONCILIATION_FAILED alert in #admins with an "Open settings" button.
 */
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getRouteParamForConnection} from '@libs/AccountingUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAutoReconciliationFailedMessage, getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type AutoReconciliationFailedMessageProps = {
    action: OnyxEntry<OnyxTypes.ReportAction>;
    policyID: string | undefined;
};

function AutoReconciliationFailedMessage({action, policyID}: AutoReconciliationFailedMessageProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const originalMessage = isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.AUTO_RECONCILIATION_FAILED) ? getOriginalMessage(action) : undefined;
    const resolvedPolicyID = originalMessage?.policyID || policyID;
    const issues = originalMessage?.issues ?? [];
    const hasExpensifyCard = issues.some((issue) => issue.programme === CONST.AUTO_RECONCILIATION_ISSUE.PROGRAMME.EXPENSIFY_CARD);
    const hasTravelBilling = issues.some((issue) => issue.programme === CONST.AUTO_RECONCILIATION_ISSUE.PROGRAMME.TRAVEL_BILLING);
    const message = getAutoReconciliationFailedMessage(translate, action, convertToDisplayString);

    const openSettings = () => {
        if (!resolvedPolicyID) {
            return;
        }
        const matchedConnection = Object.values(CONST.POLICY.CONNECTIONS.NAME).find((name) => name === originalMessage?.connectionName);
        const connectionRoute = matchedConnection ? getRouteParamForConnection(matchedConnection) : undefined;
        if (hasExpensifyCard && !hasTravelBilling && connectionRoute) {
            Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(resolvedPolicyID, connectionRoute));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_CONNECTIONS.getRoute(resolvedPolicyID, undefined, undefined, undefined, undefined, CONST.TAB.CONNECTIONS.ACCOUNTING));
    };

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
            {!!resolvedPolicyID && (
                <ActionableItemButtons layout="horizontal">
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={openSettings}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_AUTO_RECONCILIATION_OPEN_SETTINGS}
                    >
                        <Button.Text>{translate('report.actions.type.autoReconciliationFailed.openSettings')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </ReportActionItemBasicMessage>
    );
}

export default AutoReconciliationFailedMessage;
