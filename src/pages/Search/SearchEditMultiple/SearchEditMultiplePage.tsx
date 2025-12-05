import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearBulkEditDraftTransaction, initBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionChanges} from '@src/types/onyx/Transaction';

function SearchEditMultiplePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {selectedTransactions, selectedTransactionIDs} = useSearchContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: true});

    // Determine policyID based on context:
    // - If all selected transactions belong to the same policy, use that policy
    // - Otherwise, fall back to the user's active workspace policy
    const policyID = useMemo(() => {
        const transactionValues = Object.values(selectedTransactions);
        if (transactionValues.length === 0) {
            return activePolicyID;
        }

        const firstPolicyID = transactionValues[0]?.policyID;
        const allSamePolicy = transactionValues.every((t) => t.policyID === firstPolicyID);

        if (allSamePolicy && firstPolicyID) {
            return firstPolicyID;
        }

        return activePolicyID;
    }, [selectedTransactions, activePolicyID]);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID ?? '-1'}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID ?? '-1'}`, {canBeMissing: true});

    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    useEffect(() => {
        if (!draftTransaction) {
            initBulkEditDraftTransaction(currency);
        }

        return () => {
            clearBulkEditDraftTransaction();
        };
    }, []);

    const save = () => {
        if (!draftTransaction) {
            return;
        }

        const changes: TransactionChanges = {};
        if (draftTransaction.amount !== undefined && draftTransaction.amount !== 0) {
            changes.amount = draftTransaction.amount;
        }
        if (draftTransaction.currency) {
            changes.currency = draftTransaction.currency;
        }
        if (draftTransaction.merchant) {
            changes.merchant = draftTransaction.merchant;
        }
        if (draftTransaction.comment?.comment) {
            changes.comment = draftTransaction.comment.comment;
        }
        if (draftTransaction.created) {
            changes.created = draftTransaction.created;
        }
        if (draftTransaction.category) {
            changes.category = draftTransaction.category;
        }
        if (draftTransaction.tag) {
            changes.tag = draftTransaction.tag;
        }
        if (draftTransaction.billable !== undefined) {
            changes.billable = draftTransaction.billable;
        }
        if (draftTransaction.reimbursable !== undefined) {
            changes.reimbursable = draftTransaction.reimbursable;
        }

        if (Object.keys(changes).length === 0) {
            Navigation.dismissModal();
            return;
        }

        updateMultipleMoneyRequests(selectedTransactionIDs, changes, policy, policyTags, policyCategories);

        Navigation.dismissModal();
    };

    const displayCurrency = draftTransaction?.currency ?? currency;

    const attendeesTitle = useMemo(() => {
        const attendees = draftTransaction?.comment?.attendees;
        if (!Array.isArray(attendees) || attendees.length === 0) {
            return '';
        }
        return attendees.map((item) => item?.displayName ?? item?.login).join(', ');
    }, [draftTransaction?.comment?.attendees]);

    const fields = useMemo(() => {
        const allFields = [
            {
                description: translate('iou.amount'),
                title: draftTransaction?.amount ? convertToDisplayString(Math.abs(draftTransaction.amount), displayCurrency) : '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_AMOUNT_RHP,
            },
            {
                description: translate('common.description'),
                title: draftTransaction?.comment?.comment ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_DESCRIPTION_RHP,
            },
            {
                description: translate('common.merchant'),
                title: draftTransaction?.merchant ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_MERCHANT_RHP,
            },
            {
                description: translate('common.date'),
                title: draftTransaction?.created ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_DATE_RHP,
            },
            {
                description: translate('common.category'),
                title: draftTransaction?.category ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_CATEGORY_RHP,
            },
            {
                description: translate('common.tag'),
                title: draftTransaction?.tag ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_TAG_RHP,
            },
            {
                description: translate('iou.attendees'),
                title: attendeesTitle,
                route: ROUTES.SEARCH_EDIT_MULTIPLE_ATTENDEES_RHP,
            },
            {
                description: translate('common.report'),
                title: draftTransaction?.reportID ?? '',
                route: ROUTES.SEARCH_EDIT_MULTIPLE_REPORT_RHP,
            },
        ];

        return allFields;
    }, [draftTransaction, translate, displayCurrency, attendeesTitle]);

    return (
        <ScreenWrapper testID={SearchEditMultiplePage.displayName}>
            <HeaderWithBackButton
                title={translate('search.bulkActions.editMultipleTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1]}>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{translate('search.bulkActions.editMultipleDescription')}</Text>
                    {fields.map((field) => (
                        <MenuItemWithTopDescription
                            key={field.description}
                            title={field.title}
                            description={field.description}
                            onPress={() => Navigation.navigate(field.route)}
                            shouldShowRightIcon
                        />
                    ))}
                </ScrollView>
                <Button
                    success
                    large
                    text={translate('common.save')}
                    onPress={save}
                    style={[styles.m5]}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchEditMultiplePage.displayName = 'SearchEditMultiplePage';

export default SearchEditMultiplePage;
