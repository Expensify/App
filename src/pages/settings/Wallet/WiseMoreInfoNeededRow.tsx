import useLocalize from '@hooks/useLocalize';

import navigateToWiseMoreInfoNeeded from '@libs/Navigation/helpers/navigateToWiseMoreInfoNeeded';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import WalletPromptRow from './WalletPromptRow';

/**
 * The Wallet bank account row's prompt for an account Wise asked for more info on, before it can enable global reimbursements.
 */
type WiseMoreInfoNeededRowProps = {
    bankAccountID: number;

    /** Whether the user can open the business onboarding for the account, so the Review button can take them to send the info */
    canReview: boolean;

    /** Spacing for the row, which follows the list it sits in */
    style?: StyleProp<ViewStyle>;
};

/**
 * Prompts the admin under the Wallet bank account row to send Wise the info it asked for, so global reimbursements can be enabled.
 */
function WiseMoreInfoNeededRow({bankAccountID, canReview, style}: WiseMoreInfoNeededRowProps) {
    const {translate} = useLocalize();

    return (
        <WalletPromptRow
            message={translate('walletPage.wiseMoreInfoNeeded')}
            buttonText={canReview ? translate('common.review') : undefined}
            onButtonPress={() => navigateToWiseMoreInfoNeeded(bankAccountID)}
            buttonSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_MORE_INFO_NEEDED_REVIEW}
            style={style}
        />
    );
}

export default WiseMoreInfoNeededRow;
