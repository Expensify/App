import React, {useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {generateReportID} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {startMoneyRequest} from '@userActions/IOU';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';
import NewChatSelectorPage from './NewChatSelectorPage';
import UnreportedExpenseListItem from './UnreportedExpenseListItem';

type AddUnreportedExpensePageType = PlatformStackScreenProps<AddUnreportedExpensesParamList, typeof SCREENS.ADD_UNREPORTED_EXPENSES_ROOT>;

type AddUnreportedExpensesParamList = {
    [SCREENS.ADD_UNREPORTED_EXPENSES_ROOT]: {
        reportID: string;
    };
};

function AddUnreportedExpense({route}: AddUnreportedExpensePageType) {
    const {translate} = useLocalize();

    function getUnreportedTransactions(transactions: OnyxCollection<Transaction>) {
        if (!transactions) {
            return [];
        }
        return Object.values(transactions || {}).filter((item) => item?.reportID === '0');
    }

    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => getUnreportedTransactions(_transactions),
        initialValue: [],
    });

    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const sections: Array<SectionListDataType<Transaction & ListItem>> = [
        {
            shouldShow: true,
            data: transactions.filter((t): t is Transaction & ListItem => t !== undefined),
        },
    ];

    const thereIsNoUnreportedTransactions = !((sections.at(0)?.data.length ?? 0) > 0);

    const reportID = route.params.reportID;
    const selectedIds = new Set<string>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom
            shouldShowOfflineIndicator={false}
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title="Add unreported expanse"
                onBackButtonPress={Navigation.goBack}
            />

            {thereIsNoUnreportedTransactions ? (
                <EmptyStateComponent
                    cardStyles={[styles.appBG]}
                    cardContentStyles={[styles.pt5, styles.pb0]}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                    headerMedia={LottieAnimations.GenericEmptyState}
                    title="No unreported expenses"
                    subtitle="Looks like you don’t have any unreported expenses. Try creating one below."
                    headerStyles={[styles.emptyStateMoneyRequestReport]}
                    lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                    headerContentStyles={styles.emptyStateFolderWebStyles}
                    buttons={[
                        {
                            buttonText: translate('iou.createExpense'),
                            buttonAction: () => {
                                interceptAnonymousUser(() => {
                                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID);
                                });
                            },
                            success: true,
                            style: styles.unreportedExpenseCreateExpenseButton,
                        },
                    ]}
                />
            ) : (
                <SelectionList<Transaction & ListItem>
                    ref={selectionListRef}
                    onSelectRow={(item) => {
                        if (selectedIds.has(item.transactionID)) {
                            selectedIds.delete(item.transactionID);
                        } else {
                            selectedIds.add(item.transactionID);
                        }
                    }}
                    shouldShowTextInput={false}
                    canSelectMultiple
                    sections={sections}
                    ListItem={UnreportedExpenseListItem}
                    confirmButtonStyles={[styles.justifyContentCenter]}
                    showConfirmButton
                    confirmButtonText="Add to report"
                    onConfirm={() => {
                        changeTransactionsReport([...selectedIds], report?.reportID ?? '0');
                        Navigation.goBack(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute()}));
                    }}
                />
            )}
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
