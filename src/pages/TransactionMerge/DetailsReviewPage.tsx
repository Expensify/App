import {emailSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import {
    buildMergeFieldsData,
    getMergeableDataAndConflictFields,
    getMergeFieldErrorText,
    getMergeFieldUpdatedValues,
    getMergeFieldValue,
    getSourceTransactionFromMergeTransaction,
    getTargetTransactionFromMergeTransaction,
    getTransactionThreadReportID,
    isEmptyMergeValue,
} from '@libs/MergeTransactionUtils';
import type {MergeFieldKey} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {createTransactionThreadReport, openReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportActions, ReportMetadata, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MergeFieldReview from './MergeFieldReview';

type DetailsReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DETAILS_PAGE>;

const hasOnceLoadedTransactionThreadReportActionsSelector = (value?: OnyxEntry<ReportMetadata>) => value?.hasOnceLoadedReportActions;

function DetailsReviewPage({route}: DetailsReviewPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, backTo} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });

    const [hasOnceLoadedTransactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${targetTransaction?.reportID}`, {
        selector: hasOnceLoadedTransactionThreadReportActionsSelector,
        canBeMissing: true,
    });
    const targetTransactionThreadReportID = getTransactionThreadReportID(targetTransaction);
    const [iouReportForTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`, {canBeMissing: true});
    const iouActionForTargetTransactionSelector = useCallback(
        (value: OnyxEntry<ReportActions>) => {
            if (!hasOnceLoadedTransactionThreadReportActions || !!targetTransactionThreadReportID || !targetTransaction?.transactionID) {
                return undefined;
            }
            return getIOUActionForTransactionID(Object.values(value ?? {}), targetTransaction?.transactionID);
        },
        [hasOnceLoadedTransactionThreadReportActions, targetTransaction?.transactionID, targetTransactionThreadReportID],
    );

    const [iouActionForTargetTransaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetTransaction?.reportID}`,
        {
            selector: iouActionForTargetTransactionSelector,
            canBeMissing: true,
        },
        [iouActionForTargetTransactionSelector],
    );
    const [sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });
    const [originalTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction?.comment?.originalTransactionID}`, {canBeMissing: true});
    const [targetTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`, {canBeMissing: true});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [hasErrors, setHasErrors] = useState<Partial<Record<MergeFieldKey, boolean>>>({});
    const [conflictFields, setConflictFields] = useState<MergeFieldKey[]>([]);
    const [isCheckingDataBeforeGoNext, setIsCheckingDataBeforeGoNext] = useState<boolean>(false);

    useEffect(() => {
        if (!transactionID || !targetTransaction || !sourceTransaction) {
            return;
        }

        const {conflictFields: detectedConflictFields, mergeableData} = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, originalTargetTransaction, localeCompare);

        setMergeTransactionKey(transactionID, mergeableData);
        setConflictFields(detectedConflictFields as MergeFieldKey[]);
    }, [targetTransaction, sourceTransaction, originalTargetTransaction, transactionID, localeCompare]);

    useEffect(() => {
        if (!isCheckingDataBeforeGoNext) {
            return;
        }

        // When user selects a card transaction to merge, that card transaction becomes the target transaction.
        // The App may not have the transaction thread report loaded for card transactions, so we need to trigger
        // OpenReport to ensure the transaction thread report is available for confirmation page
        if (!targetTransactionThreadReportID && targetTransaction?.reportID) {
            // If the report was already loaded before, but there are still no transaction thread report info, it means it hasn't been created yet.
            // So we should create it.
            if (hasOnceLoadedTransactionThreadReportActions) {
                createTransactionThreadReport(iouReportForTargetTransaction, iouActionForTargetTransaction);
                setIsCheckingDataBeforeGoNext(false);
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
                return;
            }
            return openReport(targetTransaction.reportID);
        }
        if (targetTransactionThreadReportID && !targetTransactionThreadReport) {
            return openReport(targetTransactionThreadReportID);
        }
        // We need to wait for report to be loaded completely, avoid still optimistic loading
        if (!targetTransactionThreadReport?.reportID) {
            return;
        }

        Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        setIsCheckingDataBeforeGoNext(false);
    }, [
        isCheckingDataBeforeGoNext,
        targetTransactionThreadReportID,
        targetTransaction?.reportID,
        targetTransactionThreadReport,
        transactionID,
        hasOnceLoadedTransactionThreadReportActions,
        iouActionForTargetTransaction,
        iouReportForTargetTransaction,
        currentUserEmail,
        targetTransaction?.transactionID,
    ]);

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
            const updatedValues = getMergeFieldUpdatedValues(transaction, field, fieldValue);

            setMergeTransactionKey(transactionID, {
                ...updatedValues,
                selectedTransactionByField: {
                    ...currentSelections,
                    [field]: transaction.transactionID,
                } as Partial<Record<MergeFieldKey, string>>,
            });
        },
        [mergeTransaction?.selectedTransactionByField, transactionID],
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
            setIsCheckingDataBeforeGoNext(true);
        }
    }, [mergeTransaction, conflictFields]);

    // Build merge fields array with all necessary information
    const mergeFields = useMemo(
        () => buildMergeFieldsData(conflictFields, targetTransaction, sourceTransaction, mergeTransaction, translate),
        [conflictFields, targetTransaction, sourceTransaction, mergeTransaction, translate],
    );

    // If this screen has multiple "selection cards" on it and the user skips one or more, show an error above the footer button
    const shouldShowSubmitError = conflictFields.length > 1 && !isEmptyObject(hasErrors);

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={DetailsReviewPage.displayName}
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
                        isLoading={isCheckingDataBeforeGoNext}
                        pressOnEnter
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DetailsReviewPage.displayName = 'DetailsReviewPage';

export default DetailsReviewPage;
