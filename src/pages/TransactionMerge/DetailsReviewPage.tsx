import React from 'react';
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
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getMergeableDataAndConflictFields, getMergeFieldTranslationKey, getMergeFieldValue, getSourceTransaction, isEmptyMergeValue} from '@libs/MergeTransactionUtils';
import type {MergeFieldKey, MergeValue} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import {getCurrency} from '@libs/TransactionUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MergeFieldReview from './MergeFieldReview';

type DetailsReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DETAILS_PAGE>;

function DetailsReviewPage({route}: DetailsReviewPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, backTo} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {canBeMissing: true});
    const [sourceTransaction = getSourceTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {canBeMissing: true});

    // State for selected values and error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hasErrors, setHasErrors] = React.useState<Partial<Record<MergeFieldKey, boolean>>>({});

    const [diffFields, setDiffFields] = React.useState<MergeFieldKey[]>([]);

    React.useEffect(() => {
        if (!transactionID || !targetTransaction || !sourceTransaction) {
            return;
        }

        const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction);

        setMergeTransactionKey(transactionID, mergeableData);
        setDiffFields(conflictFields as MergeFieldKey[]);
    }, [targetTransaction, sourceTransaction, transactionID]);

    // Handle selection
    const handleSelect = (field: MergeFieldKey, value: MergeValue) => {
        // Clear error if it has
        setHasErrors((prev) => {
            const newErrors = {...prev};
            delete newErrors[field];
            return newErrors;
        });
        setMergeTransactionKey(transactionID, {
            [field]: value.value,
            ...(field === 'amount' && {currency: value.currency}),
        });
    };

    // Handle continue
    const handleContinue = () => {
        if (!mergeTransaction) {
            return;
        }

        const newHasErrors: Partial<Record<MergeFieldKey, boolean>> = {};
        diffFields.forEach((field) => {
            if (!isEmptyMergeValue(mergeTransaction[field])) {
                return;
            }

            newHasErrors[field] = true;
        });
        setHasErrors(newHasErrors);

        if (isEmptyObject(newHasErrors)) {
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        }
    };

    // If this screen has multiple "selection cards" on it and the user skips one or more, show an error above the footer button
    const shouldShowSubmitError = diffFields.length > 1 && !isEmptyObject(hasErrors);

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
                    {diffFields.map((field) => {
                        const targetValue = getMergeFieldValue(targetTransaction, field);
                        const sourceValue = getMergeFieldValue(sourceTransaction, field);

                        const fieldTranslated = translate(getMergeFieldTranslationKey(field) as TranslationPaths);

                        const formatValue = (mergeValue: MergeValue) => {
                            const {value, currency} = mergeValue;

                            if (isEmptyMergeValue(value)) {
                                return '';
                            }

                            if (typeof value === 'boolean') {
                                return value ? translate('common.yes') : translate('common.no');
                            }

                            if (field === 'amount') {
                                return convertToDisplayString(Math.abs(Number(value)), currency);
                            }

                            return String(value);
                        };

                        const selectedValue = {
                            value: mergeTransaction?.[field] ?? '',
                            currency: mergeTransaction?.currency ?? '',
                        };

                        const targetMergeValue: MergeValue = {
                            value: targetValue,
                            currency: field === 'amount' ? getCurrency(targetTransaction) : '',
                        };

                        const sourceMergeValue: MergeValue = {
                            value: sourceValue,
                            currency: field === 'amount' ? getCurrency(sourceTransaction) : '',
                        };

                        return (
                            <MergeFieldReview
                                key={field}
                                field={fieldTranslated}
                                values={[targetMergeValue, sourceMergeValue]}
                                selectedValue={selectedValue ?? {}}
                                onValueSelected={(value) => handleSelect(field, value)}
                                formatValue={formatValue}
                                errorText={hasErrors[field] ? translate('transactionMerge.detailsPage.pleaseSelectError', {field: fieldTranslated}) : undefined}
                            />
                        );
                    })}
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

DetailsReviewPage.displayName = 'DetailsReviewPage';

export default DetailsReviewPage;
