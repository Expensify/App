import React, {useMemo} from 'react';
import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';
import BaseWidgetItem from '@components/BaseWidgetItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';
import type {OriginalMessageCardFraudAlert} from '@src/types/onyx/OriginalMessage';

type ReviewCardFraudProps = {
    /** The card with potential fraud */
    card: Card;
};

function ReviewCardFraud({card}: ReviewCardFraudProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    // Get the fraud alert report ID and action ID for deeplink navigation
    const fraudAlertReportID = card.message?.possibleFraud?.fraudAlertReportID;
    const fraudAlertReportActionID = card.message?.possibleFraud?.fraudAlertReportActionID;

    // Fetch the report actions to get the fraud details (amount, merchant, currency)
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fraudAlertReportID}`, {
        canBeMissing: true,
    });

    // Extract fraud details from the report action
    const fraudDetails = useMemo(() => {
        if (!fraudAlertReportActionID || !reportActions) {
            return null;
        }

        const fraudAction = reportActions[fraudAlertReportActionID];
        if (!fraudAction || fraudAction.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) {
            return null;
        }

        const message = fraudAction.originalMessage as OriginalMessageCardFraudAlert | undefined;
        if (!message) {
            return null;
        }

        return {
            triggerAmount: message.triggerAmount,
            triggerMerchant: message.triggerMerchant,
            currency: message.currency ?? CONST.CURRENCY.USD,
        };
    }, [fraudAlertReportActionID, reportActions]);

    const handleReviewPress = () => {
        if (!fraudAlertReportID) {
            return;
        }

        // Navigate to the report containing the fraud alert action
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(String(fraudAlertReportID)));
    };

    // Generate the title with amount and merchant if available
    const title = useMemo(() => {
        if (fraudDetails) {
            const formattedAmount = convertToDisplayString(fraudDetails.triggerAmount, fraudDetails.currency);
            return translate('homePage.timeSensitiveSection.reviewCardFraud.titleWithDetails', {
                amount: formattedAmount,
                merchant: fraudDetails.triggerMerchant,
            });
        }
        return translate('homePage.timeSensitiveSection.reviewCardFraud.title');
    }, [fraudDetails, translate]);

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={title}
            subtitle={translate('homePage.timeSensitiveSection.reviewCardFraud.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.reviewCardFraud.cta')}
            onCtaPress={handleReviewPress}
            buttonProps={{danger: true}}
        />
    );
}

export default ReviewCardFraud;
