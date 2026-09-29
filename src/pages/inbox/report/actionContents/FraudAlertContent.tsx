import Button from '@components/Button';
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
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const reportActionID = action?.reportActionID;
    const originalMessage = getOriginalMessage(action);
    const cardID = originalMessage?.cardID;
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(String(cardID))});
    const possibleFraud = card?.nameValuePairs?.possibleFraud ?? null;

    const message = getActionableCardFraudAlertMessage(translate, dateFnsLocale, action, getLocalDateFromDatetime, convertToDisplayString);

    return (
        <View
            accessibilityRole={CONST.ROLE.ALERT}
            accessibilityLiveRegion="assertive"
            accessibilityLabel={translate('reportFraudConfirmationPage.title')}
        >
            <ReportActionItemBasicMessage message={message} />
            {!originalMessage?.resolution && (
                <ActionableItemButtons layout="horizontal">
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => {
                            resolveFraudAlert(cardID, false, reportID, reportActionID, possibleFraud);
                        }}
                    >
                        <Button.Text>{translate('cardPage.cardFraudAlert.confirmButtonText')}</Button.Text>
                    </Button>
                    <Button
                        onPress={() => {
                            resolveFraudAlert(cardID, true, reportID, reportActionID, possibleFraud);
                        }}
                    >
                        <Button.Text>{translate('cardPage.cardFraudAlert.reportFraudButtonText')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </View>
    );
}

export default FraudAlertContent;
