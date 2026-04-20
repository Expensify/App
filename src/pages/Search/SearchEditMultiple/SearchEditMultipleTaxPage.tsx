import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchBulkEditPolicyID from '@hooks/useSearchBulkEditPolicyID';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {transformedTaxRates} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleTaxPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);

    const policyID = useSearchBulkEditPolicyID();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const selectedTaxRate = draftTransaction?.taxCode ? (Object.values(transformedTaxRates(policy)).find((rate) => rate.code === draftTransaction.taxCode)?.modifiedName ?? '') : '';

    const onSubmit = (taxes: TaxRatesOption) => {
        const nextTaxCode = taxes.code ?? '';
        const currentTaxCode = draftTransaction?.taxCode ?? '';

        // If the selected tax rate is the same as the current one, clear it
        if (nextTaxCode === currentTaxCode) {
            updateBulkEditDraftTransaction({
                taxCode: null,
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
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleTaxPage"
        >
            <HeaderWithBackButton
                title={policy?.taxRates?.name ?? translate('common.tax')}
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
