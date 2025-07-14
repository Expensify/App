import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import {getMergeableDataAndConflictFields, getSourceTransaction} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MergeTransaction, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MergeFieldReview from './MergeFieldReview';

type DetailsReviewProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DETAILS_PAGE>;
type MergeValueType = string | boolean;

// Define the specific merge fields we want to handle
const MERGE_FIELDS = ['merchant', 'category', 'tag', 'description', 'reimbursable', 'billable'] as const;
type MergeFieldKey = TupleToUnion<typeof MERGE_FIELDS>;

const MERGE_FIELDS_LABEL_TRANSLATION_KEYS: Record<MergeFieldKey, string> = {
    merchant: 'common.merchant',
    category: 'common.category',
    tag: 'common.tag',
    description: 'common.description',
    reimbursable: 'common.reimbursable',
    billable: 'common.billable',
};

function DetailsReview({route}: DetailsReviewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, backTo} = route.params;

    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});
    const sourceTransaction = getSourceTransaction(mergeTransaction);

    // State for selected values and error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hasErrors, setHasErrors] = React.useState<Partial<Record<MergeFieldKey, boolean>>>({});

    const [diffFields, setDiffFields] = React.useState<MergeFieldKey[]>([]);

    React.useEffect(() => {
        if (!transactionID || !targetTransaction || !sourceTransaction) {
            return;
        }

        const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(
            transactionID,
            targetTransaction,
            sourceTransaction,
            MERGE_FIELDS as unknown as Array<keyof MergeTransaction>,
        );

        setMergeTransactionKey(transactionID, mergeableData);
        setDiffFields(conflictFields as MergeFieldKey[]);
    }, [targetTransaction, sourceTransaction, transactionID]);

    // Handle selection
    const handleSelect = (field: MergeFieldKey, value: MergeValueType) => {
        // Clear error if it has
        setHasErrors((prev) => {
            const newErrors = {...prev};
            delete newErrors[field];
            return newErrors;
        });
        setMergeTransactionKey(transactionID, {[field]: value});
    };

    // Handle continue
    const handleContinue = () => {
        if (!mergeTransaction) {
            return;
        }

        const newHasErrors: Partial<Record<MergeFieldKey, boolean>> = {};
        diffFields.forEach((field) => {
            if (mergeTransaction[field]) {
                return;
            }

            newHasErrors[field] = true;
        });
        setHasErrors(newHasErrors);

        if (isEmptyObject(newHasErrors)) {
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getReportRHPActiveRoute()));
        }
    };

    // If this screen has multiple "selection cards" on it and the user skips one or more, show an error above the footer button
    const shouldShowSubmitError = diffFields.length > 1 && !isEmptyObject(hasErrors);

    return (
        <ScreenWrapper
            testID={DetailsReview.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.detailsPage.header')}
                    onBackButtonPress={() => {
                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }
                        Navigation.goBack();
                    }}
                />
                <ScrollView style={[styles.flex1, styles.p5]}>
                    <View style={[styles.mb5]}>
                        <Text>{translate('transactionMerge.detailsPage.pageTitle')}</Text>
                    </View>
                    {diffFields.map((field) => {
                        const targetValue = (targetTransaction?.[field as keyof Transaction] ?? '') as string;
                        const sourceValue = (sourceTransaction?.[field as keyof Transaction] ?? '') as string;
                        const selectedValue = mergeTransaction?.[field] as MergeValueType | undefined;
                        const fieldTranslated = translate(MERGE_FIELDS_LABEL_TRANSLATION_KEYS[field] as TranslationPaths);

                        return (
                            <MergeFieldReview
                                key={field}
                                field={fieldTranslated}
                                values={[targetValue, sourceValue]}
                                selectedValue={selectedValue ?? ''}
                                onValueSelected={(value) => handleSelect(field, value)}
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

DetailsReview.displayName = 'DetailsReview';

export default DetailsReview;
