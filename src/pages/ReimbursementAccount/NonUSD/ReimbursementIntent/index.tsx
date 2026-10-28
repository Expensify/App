import Icon from '@components/Icon';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import ABAWithdrawalDetails from './ABAWithdrawalDetails';

const {PAGE_NAME, REIMBURSEMENT_INTENT_STEP} = CONST.NON_USD_BANK_ACCOUNT;

type IntentOptionProps = {
    /** Illustration shown at the start of the row */
    illustration: IconAsset;

    title: string;

    description: string;

    onPress?: () => void;
};

function IntentOption({illustration, title, description, onPress}: IntentOptionProps) {
    const styles = useThemeStyles();

    return (
        <MenuItem.Root
            onPress={onPress}
            accessibilityLabel={title}
            style={styles.purposeMenuItem}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <Icon
                        src={illustration}
                        width={variables.menuIconSize}
                        height={variables.menuIconSize}
                        additionalStyles={[styles.ml3, styles.mr2]}
                    />
                </MenuItem.Leading>
                <MenuItem.Content>
                    <MenuItem.Title>{title}</MenuItem.Title>
                    <MenuItem.Description>{description}</MenuItem.Description>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

/**
 * Lets an AUD workspace choose between setting up its account to pay through Expensify,
 * or to pay outside of Expensify with ABA files.
 */
function ReimbursementIntent({onSubmit, onBackButtonPress, policyID, currency, currentSubPage, backTo}: NonUSDPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['HandCard', 'ReportReceipt']);

    if (currentSubPage === REIMBURSEMENT_INTENT_STEP.SUB_PAGE_NAMES.ABA_WITHDRAWAL_DETAILS && policyID) {
        return (
            <ABAWithdrawalDetails
                policyID={policyID}
                currency={currency}
                onBackButtonPress={() => Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.REIMBURSEMENT_INTENT, backTo}))}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="ReimbursementIntent"
            handleBackButtonPress={onBackButtonPress}
            headerTitle={translate('bankAccount.addBankAccount')}
        >
            <View style={styles.mh5}>
                <Text style={styles.textHeadlineLineHeightXXL}>{translate('reimbursementIntentStep.title')}</Text>
                <Text style={[styles.textSupporting, styles.mt1, styles.mb6]}>{translate('reimbursementIntentStep.subtitle')}</Text>
                <IntentOption
                    illustration={illustrations.HandCard}
                    title={translate('reimbursementIntentStep.payViaExpensify')}
                    description={translate('reimbursementIntentStep.payViaExpensifyDescription')}
                    onPress={onSubmit}
                />
                <IntentOption
                    illustration={illustrations.ReportReceipt}
                    title={translate('reimbursementIntentStep.payViaABAFile')}
                    description={translate('reimbursementIntentStep.payViaABAFileDescription')}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({
                                policyID,
                                page: PAGE_NAME.REIMBURSEMENT_INTENT,
                                subPage: REIMBURSEMENT_INTENT_STEP.SUB_PAGE_NAMES.ABA_WITHDRAWAL_DETAILS,
                                backTo,
                            }),
                        )
                    }
                />
            </View>
        </InteractiveStepWrapper>
    );
}

export default ReimbursementIntent;
