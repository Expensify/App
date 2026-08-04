import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getActionableCardFraudAlertMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {resolveFraudAlert} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {cardByIdSelector} from '@selectors/Card';
import React from 'react';
import {View} from 'react-native';

type FraudAlertContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT>;
    reportID: string | undefined;
};

function FraudAlertContent({action, reportID}: FraudAlertContentProps) {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const reportActionID = action?.reportActionID;
    const originalMessage = getOriginalMessage(action);
    const cardID = originalMessage?.cardID;
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(String(cardID))});
    const possibleFraud = card?.nameValuePairs?.possibleFraud ?? null;

    const buttons: ActionableItem[] = originalMessage?.resolution
        ? []
        : [
              {
                  translationKey: 'cardPage.cardFraudAlert.confirmButtonText',
                  key: `${action.reportActionID}-cardFraudAlert-confirm`,
                  onPress: () => {
                      resolveFraudAlert(cardID, false, reportID, reportActionID, possibleFraud);
                  },
                  isPrimary: true,
              },
              {
                  translationKey: 'cardPage.cardFraudAlert.reportFraudButtonText',
                  key: `${action.reportActionID}-cardFraudAlert-reportFraud`,
                  onPress: () => {
                      resolveFraudAlert(cardID, true, reportID, reportActionID, possibleFraud);
                  },
              },
          ];
    const message = getActionableCardFraudAlertMessage(translate, action, getLocalDateFromDatetime, convertToDisplayString);

    return (
        <View
            accessibilityRole={CONST.ROLE.ALERT}
            accessibilityLiveRegion="assertive"
            accessibilityLabel={translate('reportFraudConfirmationPage.title')}
        >
            <ReportActionItemBasicMessage message={message} />
            {buttons.length > 0 && (
                <ActionableItemButtons
                    items={buttons}
                    layout="horizontal"
                />
            )}
        </View>
    );
}

export default FraudAlertContent;
