import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    buildMergeFieldsData,
    getMergeableDataAndConflictFields,
    getMergeFieldErrorText,
    getMergeFieldUpdatedValues,
    getMergeFieldValue,
    isEmptyMergeValue,
} from '@libs/MergeTransactionUtils';
import type {MergeFieldKey} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import {getTransactionDetails} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MergeFieldReview from './MergeFieldReview';

type DetailsReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DETAILS_PAGE>;

function DetailsReviewPage({route}: DetailsReviewPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, isOnSearch, backTo} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const {targetTransaction, sourceTransaction, targetTransactionReport, sourceTransactionReport} = useMergeTransactions({mergeTransaction});

    const [hasErrors, setHasErrors] = useState<Partial<Record<MergeFieldKey, boolean>>>({});
    const [conflictFields, setConflictFields] = useState<MergeFieldKey[]>([]);

    useEffect(() => {
        if (!transactionID || !targetTransaction || !sourceTransaction) {
            return;
        }

        const {conflictFields: detectedConflictFields, mergeableData} = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, localeCompare, [
            targetTransactionReport,
            sourceTransactionReport,
        ]);

        setMergeTransactionKey(transactionID, mergeableData);
        setConflictFields(detectedConflictFields as MergeFieldKey[]);
    }, [targetTransaction, sourceTransaction, transactionID, localeCompare, sourceTransactionReport, targetTransactionReport]);

    // Handle selection
    const handleSelect = useCallback(
        (transaction: Transaction, field: MergeFieldKey) => {
            const fieldValue = getMergeFieldValue(getTransactionDetails(transaction), transaction, field);

            // Clear error if it has
            setHasErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });

            // Update both the field value and track which transaction was selected (persisted in Onyx)
            const currentSelections = mergeTransaction?.selectedTransactionByField ?? {};
            const updatedValues = getMergeFieldUpdatedValues(transaction, field, fieldValue, [targetTransactionReport, sourceTransactionReport]);

            setMergeTransactionKey(transactionID, {
                ...updatedValues,
                selectedTransactionByField: {
                    ...currentSelections,
                    [field]: transaction.transactionID,
                } as Partial<Record<MergeFieldKey, string>>,
            });
        },
        [mergeTransaction?.selectedTransactionByField, transactionID, targetTransactionReport, sourceTransactionReport],
    );

    // Handle continue
    const handleContinue = useCallback(() => {
        if (!mergeTransaction) {
            return;
        }

        const newHasErrors: Partial<Record<MergeFieldKey, boolean>> = {};
        for (const field of conflictFields) {
            if (!isEmptyMergeValue(mergeTransaction[field])) {
                continue;
            }

            newHasErrors[field] = true;
        }
        setHasErrors(newHasErrors);

        if (isEmptyObject(newHasErrors)) {
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute(), isOnSearch));
        }
    }, [mergeTransaction, conflictFields, transactionID, isOnSearch]);

    // Build merge fields array with all necessary information
    const mergeFields = useMemo(
        () => buildMergeFieldsData(conflictFields, targetTransaction, sourceTransaction, mergeTransaction, translate, [targetTransactionReport, sourceTransactionReport]),
        [conflictFields, targetTransaction, sourceTransaction, mergeTransaction, targetTransactionReport, sourceTransactionReport, translate],
    );

    // If this screen has multiple "selection cards" on it and the user skips one or more, show an error above the footer button
    const shouldShowSubmitError = conflictFields.length > 1 && !isEmptyObject(hasErrors);

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="DetailsReviewPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.detailsPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack(backTo);
                    }}
                />
                <ScrollView style={[styles.flex1, styles.ph5]}>
                    <View style={[styles.mb5]}>
                        <Text>{translate('transactionMerge.detailsPage.pageTitle')}</Text>
                    </View>
                    {mergeFields.map((mergeField) => (
                        <MergeFieldReview
                            key={mergeField.field}
                            mergeField={mergeField}
                            onValueSelected={handleSelect}
                            errorText={hasErrors[mergeField.field] ? getMergeFieldErrorText(translate, mergeField) : undefined}
                        />
                    ))}
                </ScrollView>
                <FixedFooter style={styles.ph5}>
                    {shouldShowSubmitError && (
                        <FormHelpMessage
                            message={translate('transactionMerge.detailsPage.selectAllDetailsError')}
                            style={[styles.pv2]}
                        />
                    )}
                    <Button
                        large
                        success
                        text={translate('common.continue')}
                        onPress={handleContinue}
                        isDisabled={!isEmptyObject(hasErrors)}
                        pressOnEnter
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DetailsReviewPage;
