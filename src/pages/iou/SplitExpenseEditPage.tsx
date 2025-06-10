import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeSplitExpenseField, updateSplitExpenseField} from '@libs/actions/IOU';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getPolicy, getTagLists} from '@libs/PolicyUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getParsedComment, getReportOrDraftReport, getTransactionDetails} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTag} from '@libs/TransactionUtils';
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
    const splitExpenseDraftTransactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(splitExpenseDraftTransaction) ?? {}, [splitExpenseDraftTransaction]);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    const policy = getPolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: false});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: false});

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});
    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;

    const [draftTransactionWithSplitExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const splitExpensesList = draftTransactionWithSplitExpenses?.comment?.splitExpenses;

    const currentAmount = transactionDetailsAmount >= 0 ? Math.abs(Number(splitExpenseDraftTransactionDetails?.amount)) : Number(splitExpenseDraftTransactionDetails?.amount);
    const currentDescription = getParsedComment(Parser.htmlToMarkdown(splitExpenseDraftTransactionDetails?.comment ?? ''));

    const transactionTag = getTag(splitExpenseDraftTransaction);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const shouldShowTag = !!policy?.areTagsEnabled && !!(transactionTag || hasEnabledTags(policyTagLists));
    const shouldShowCategory = !!policy?.areCategoriesEnabled && !!policyCategories;

    return (
        <ScreenWrapper testID={SplitExpenseEditPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(splitExpenseDraftTransaction)}>
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
                        />
                        {shouldShowCategory && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('common.category')}
                                description={translate('common.category')}
                                title={splitExpenseDraftTransactionDetails?.category}
                                numberOfLinesTitle={2}
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
                        {shouldShowTag && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('workspace.common.tags')}
                                description={translate('workspace.common.tags')}
                                title={transactionTag}
                                numberOfLinesTitle={2}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT_EXPENSE,
                                            0,
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
                    </ScrollView>
                    <FixedFooter style={styles.mtAuto}>
                        {Number(splitExpensesList?.length) > 2 && (
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
                                updateSplitExpenseField(splitExpenseDraftTransaction, splitExpenseTransactionID);
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
