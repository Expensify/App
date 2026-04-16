import React from 'react';
import {View} from 'react-native';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useLocalize from '@hooks/useLocalize';
import {getActionableCardFraudAlertMessage, getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import {resolveFraudAlert} from '@userActions/Card';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {PossibleFraudData} from '@src/types/onyx/Card';

type FraudAlertContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT>;
    reportID: string | undefined;
    possibleFraud: PossibleFraudData | null;
};

function FraudAlertContent({action, reportID, possibleFraud}: FraudAlertContentProps) {
    const {translate, getLocalDateFromDatetime} = useLocalize();

    const reportActionID = action?.reportActionID;
    const originalMessage = getOriginalMessage(action);
    const cardID = originalMessage?.cardID;

    const buttons: ActionableItem[] = originalMessage?.resolution
        ? []
        : [
              {
                  text: 'cardPage.cardFraudAlert.confirmButtonText',
                  key: `${action.reportActionID}-cardFraudAlert-confirm`,
                  onPress: () => {
                      resolveFraudAlert(cardID, false, reportID, reportActionID, possibleFraud);
                  },
                  isPrimary: true,
              },
              {
                  text: 'cardPage.cardFraudAlert.reportFraudButtonText',
                  key: `${action.reportActionID}-cardFraudAlert-reportFraud`,
                  onPress: () => {
                      resolveFraudAlert(cardID, true, reportID, reportActionID, possibleFraud);
                  },
              },
          ];
    const message = getActionableCardFraudAlertMessage(translate, action, getLocalDateFromDatetime);

    return (
        <View
            accessibilityRole={CONST.ROLE.ALERT}
            accessibilityLabel={translate('reportFraudConfirmationPage.title')}
        >
            <ReportActionItemBasicMessage message={message} />
            {buttons.length > 0 && (
                <ActionableItemButtons
                    items={buttons}
                    shouldUseLocalization
                    layout="horizontal"
                />
            )}
        </View>
    );
}

FraudAlertContent.displayName = 'FraudAlertContent';

export default FraudAlertContent;
