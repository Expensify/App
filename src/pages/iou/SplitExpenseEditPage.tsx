import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeSplitExpenseField, updateSplitExpenseField} from '@libs/actions/IOU';
import {getDecodedCategoryName, isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getTagLists} from '@libs/PolicyUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getParsedComment, getReportName, getReportOrDraftReport, getTransactionDetails} from '@libs/ReportUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTag, getTagForDisplay} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpenseEditPage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {reportID, transactionID, splitExpenseTransactionID = '', backTo} = route.params;
    const report = getReportOrDraftReport(reportID);

    const [splitExpenseDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: false});
    const [originalTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${splitExpenseDraftTransaction?.comment?.originalTransactionID}`, {canBeMissing: false}, [
        splitExpenseDraftTransaction?.comment?.originalTransactionID,
    ]);

    const splitExpenseDraftTransactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(splitExpenseDraftTransaction) ?? {}, [splitExpenseDraftTransaction]);

    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: false});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: false});

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: false});
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;

    const [draftTransactionWithSplitExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const splitExpensesList = draftTransactionWithSplitExpenses?.comment?.splitExpenses;

    const currentAmount = transactionDetailsAmount >= 0 ? Math.abs(Number(splitExpenseDraftTransactionDetails?.amount)) : Number(splitExpenseDraftTransactionDetails?.amount);
    const currentDescription = getParsedComment(Parser.htmlToMarkdown(splitExpenseDraftTransactionDetails?.comment ?? ''));

    const shouldShowCategory = !!policy?.areCategoriesEnabled && !!policyCategories;

    const transactionTag = getTag(splitExpenseDraftTransaction);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const isSplitAvailable = report && transaction && isSplitAction(report, [transaction], originalTransaction, policy);

    const isCategoryRequired = !!policy?.requiresCategory;
    const reportName = getReportName(report, policy);
    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, splitExpenseDraftTransactionDetails?.category, policy?.areRulesEnabled);

    const shouldShowTags = !!policy?.areTagsEnabled && !!(transactionTag || hasEnabledTags(policyTagLists));
    const tagVisibility = useMemo(
        () =>
            getTagVisibility({
                shouldShowTags,
                policy,
                policyTags,
                transaction: splitExpenseDraftTransaction,
            }),
        [shouldShowTags, policy, policyTags, splitExpenseDraftTransaction],
    );

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    return (
        <ScreenWrapper testID={SplitExpenseEditPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(splitExpenseDraftTransaction) || !isSplitAvailable}>
                <View style={[styles.flex1]}>
                    <HeaderWithBackButton
                        title={translate('iou.splitExpenseEditTitle', {
                            amount: convertToDisplayString(currentAmount, splitExpenseDraftTransactionDetails?.currency),
                            merchant: splitExpenseDraftTransaction?.merchant ?? '',
                        })}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <ScrollView>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            shouldRenderAsHTML
                            key={translate('common.description')}
                            description={translate('common.description')}
                            title={currentDescription}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        CONST.IOU.TYPE.SPLIT_EXPENSE,
                                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                        reportID,
                                        Navigation.getActiveRoute(),
                                    ),
                                );
                            }}
                            style={[styles.moneyRequestMenuItem]}
                            titleWrapperStyle={styles.flex1}
                            numberOfLinesTitle={2}
                            rightLabel={isDescriptionRequired ? translate('common.required') : ''}
                        />
                        {shouldShowCategory && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('common.category')}
                                description={translate('common.category')}
                                title={getDecodedCategoryName(splitExpenseDraftTransactionDetails?.category ?? '')}
                                numberOfLinesTitle={2}
                                rightLabel={isCategoryRequired ? translate('common.required') : ''}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT_EXPENSE,
                                            CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                            reportID,
                                            Navigation.getActiveRoute(),
                                        ),
                                    );
                                }}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                            />
                        )}
                        {shouldShowTags &&
                            policyTagLists.map(({name}, index) => {
                                const tagVisibilityItem = tagVisibility.at(index);
                                const shouldShow = tagVisibilityItem?.shouldShow ?? false;
                                const isTagRequired = tagVisibilityItem?.isTagRequired ?? false;
                                const prevShouldShow = previousTagsVisibility.at(index) ?? false;

                                if (!shouldShow) {
                                    return null;
                                }

                                return (
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        key={name}
                                        highlighted={!getTagForDisplay(splitExpenseDraftTransaction, index) && !prevShouldShow}
                                        title={getTagForDisplay(splitExpenseDraftTransaction, index)}
                                        description={name}
                                        shouldShowBasicTitle
                                        shouldShowDescriptionOnTop
                                        numberOfLinesTitle={2}
                                        rightLabel={isTagRequired ? translate('common.required') : ''}
                                        onPress={() => {
                                            Navigation.navigate(
                                                ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                                    CONST.IOU.ACTION.EDIT,
                                                    CONST.IOU.TYPE.SPLIT_EXPENSE,
                                                    index,
                                                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                                    reportID,
                                                    Navigation.getActiveRoute(),
                                                ),
                                            );
                                        }}
                                        style={[styles.moneyRequestMenuItem]}
                                        titleStyle={styles.flex1}
                                    />
                                );
                            })}
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            key={translate('common.date')}
                            description={translate('common.date')}
                            title={splitExpenseDraftTransactionDetails?.created}
                            numberOfLinesTitle={2}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        CONST.IOU.TYPE.SPLIT_EXPENSE,
                                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                        reportID,
                                        Navigation.getActiveRoute(),
                                    ),
                                );
                            }}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                        />
                        <MenuItemWithTopDescription
                            key={translate('common.report')}
                            description={translate('common.report')}
                            title={reportName}
                            numberOfLinesTitle={2}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            interactive={false}
                        />
                    </ScrollView>
                    <FixedFooter style={styles.mtAuto}>
                        {Number(splitExpensesList?.length) > 1 && (
                            <Button
                                danger
                                large
                                style={[styles.w100, styles.mb4]}
                                text={translate('iou.removeSplit')}
                                onPress={() => {
                                    removeSplitExpenseField(draftTransactionWithSplitExpenses, splitExpenseTransactionID);
                                    Navigation.goBack(backTo);
                                }}
                                pressOnEnter
                                enterKeyEventListenerPriority={1}
                            />
                        )}
                        <Button
                            success
                            large
                            style={[styles.w100]}
                            text={translate('common.save')}
                            onPress={() => {
                                updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID);
                                Navigation.goBack(backTo);
                            }}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                        />
                    </FixedFooter>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}
SplitExpenseEditPage.displayName = 'SplitExpenseEditPage';

export default SplitExpenseEditPage;
