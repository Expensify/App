import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
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
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import type {TransactionDetails} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

import MergeFieldReview from './MergeFieldReview';

type DynamicDetailsReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DYNAMIC_DETAILS_PAGE>;

function DynamicDetailsReviewPage({route}: DynamicDetailsReviewPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const {transactionID, isOnSearch} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.path);

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const {targetTransaction, sourceTransaction, targetTransactionReport, sourceTransactionReport, targetTransactionPolicy, sourceTransactionPolicy} = useMergeTransactions({
        mergeTransaction,
    });
    const sourceReportOwnerAsAttendee = useReportOwnerAsAttendee(sourceTransaction);
    const targetReportOwnerAsAttendee = useReportOwnerAsAttendee(targetTransaction);

    const [hasErrors, setHasErrors] = useState<Partial<Record<MergeFieldKey, boolean>>>({});

    const conflictFields = useMemo(() => {
        if (!transactionID || !targetTransaction || !sourceTransaction) {
            return [];
        }

        const {conflictFields: detectedConflictFields, mergeableData} = getMergeableDataAndConflictFields(
            targetTransaction,
            sourceTransaction,
            localeCompare,
            getCurrencyDecimals,
            [targetTransactionReport, sourceTransactionReport],
            targetTransactionPolicy,
            sourceTransactionPolicy,
        );

        setMergeTransactionKey(transactionID, mergeableData);
        return detectedConflictFields as MergeFieldKey[];
    }, [
        targetTransaction,
        sourceTransaction,
        transactionID,
        localeCompare,
        sourceTransactionReport,
        targetTransactionReport,
        targetTransactionPolicy,
        sourceTransactionPolicy,
        getCurrencyDecimals,
    ]);

    // Handle selection
    const handleSelect = useCallback(
        (transaction: Transaction, transactionDetails: TransactionDetails, field: MergeFieldKey) => {
            const fieldValue = getMergeFieldValue(transactionDetails, transaction, field);

            // Clear error if it has
            setHasErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });

            // Update both the field value and track which transaction was selected (persisted in Onyx)
            const currentSelections = mergeTransaction?.selectedTransactionByField ?? {};
            const updatedValues = getMergeFieldUpdatedValues({
                transaction,
                field,
                fieldValue,
                getCurrencyDecimals,
                mergeTransaction,
                searchReports: [targetTransactionReport, sourceTransactionReport],
                policy: transaction.transactionID === targetTransaction?.transactionID ? targetTransactionPolicy : sourceTransactionPolicy,
            });

            setMergeTransactionKey(transactionID, {
                ...updatedValues,
                selectedTransactionByField: {
                    ...currentSelections,
                    [field]: transaction.transactionID,
                } as Partial<Record<MergeFieldKey, string>>,
            });
        },
        [
            mergeTransaction,
            transactionID,
            targetTransactionReport,
            sourceTransactionReport,
            targetTransaction?.transactionID,
            targetTransactionPolicy,
            sourceTransactionPolicy,
            getCurrencyDecimals,
        ],
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
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, isOnSearch), backPath));
        }
    }, [mergeTransaction, conflictFields, transactionID, isOnSearch, backPath]);

    // Build merge fields array with all necessary information
    const mergeFields = useMemo(
        () =>
            buildMergeFieldsData({
                conflictFields,
                targetTransaction,
                sourceTransaction,
                targetReportOwnerAsAttendee,
                sourceReportOwnerAsAttendee,
                mergeTransaction,
                targetTransactionPolicy,
                sourceTransactionPolicy,
                translate,
                convertToDisplayString,
                localeCompare,
                reports: [targetTransactionReport, sourceTransactionReport],
            }),
        [
            conflictFields,
            targetTransaction,
            sourceTransaction,
            targetReportOwnerAsAttendee,
            sourceReportOwnerAsAttendee,
            mergeTransaction,
            targetTransactionReport,
            sourceTransactionReport,
            targetTransactionPolicy,
            sourceTransactionPolicy,
            translate,
            convertToDisplayString,
            localeCompare,
        ],
    );

    // If this screen has multiple "selection cards" on it and the user skips one or more, show an error above the footer button
    const shouldShowSubmitError = conflictFields.length > 1 && !isEmptyObject(hasErrors);

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'TransactionMerge.DetailsReviewPage',
            isLoadingMergeTransaction: isLoadingOnyxValue(mergeTransactionMetadata),
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            testID="DynamicDetailsReviewPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.detailsPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack();
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

export default DynamicDetailsReviewPage;
