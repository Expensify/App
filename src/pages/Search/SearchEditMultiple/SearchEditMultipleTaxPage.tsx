import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getTaxName} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleTaxPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, allTransactions, allReports);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    const selectedTaxRate = draftTransaction?.taxCode ? getTaxName(policy, draftTransaction) : '';

    const onSubmit = (taxes: TaxRatesOption) => {
        const nextTaxCode = taxes.code ?? '';
        const currentTaxCode = draftTransaction?.taxCode ?? '';

        // If the selected tax rate is the same as the current one, clear it
        if (nextTaxCode === currentTaxCode) {
            updateBulkEditDraftTransaction({
                taxCode: undefined,
            });
            Navigation.goBack();
            return;
        }

        updateBulkEditDraftTransaction({
            taxCode: nextTaxCode,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="SearchEditMultipleTaxPage"
        >
            <HeaderWithBackButton
                title={translate('iou.taxRate')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1, styles.w100]}>
                <TaxPicker
                    selectedTaxRate={selectedTaxRate}
                    policyID={policyID}
                    onSubmit={onSubmit}
                    onDismiss={Navigation.goBack}
                    action={CONST.IOU.ACTION.EDIT}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    allowDeselect
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchEditMultipleTaxPage;
