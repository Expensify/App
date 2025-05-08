import React, {useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {startMoneyRequest} from '@userActions/IOU';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
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
    const [errorMessage, setErrorMessage] = useState<string>('');

    function getUnreportedTransactions(transactions: OnyxCollection<Transaction>) {
        if (!transactions) {
            return [];
        }
        return Object.values(transactions || {}).filter((item) => item?.reportID === '0');
    }

    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => getUnreportedTransactions(_transactions),
        initialValue: [],
        canBeMissing: true,
    });

    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const sections: Array<SectionListDataType<Transaction & ListItem>> = [
        {
            shouldShow: true,
            data: transactions.filter((t): t is Transaction & ListItem => t !== undefined),
        },
    ];

    const thereIsNoUnreportedTransaction = !((sections.at(0)?.data.length ?? 0) > 0);

    const reportID = route.params.reportID;
    const selectedIds = new Set<string>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title={translate('iou.addUnreportedExpense')}
                onBackButtonPress={Navigation.goBack}
            />

            {thereIsNoUnreportedTransaction ? (
                <EmptyStateComponent
                    cardStyles={[styles.appBG]}
                    cardContentStyles={[styles.pt5, styles.pb0]}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                    headerMedia={LottieAnimations.GenericEmptyState}
                    title={translate('iou.emptyStateUnreportedExpenseTitle')}
                    subtitle={translate('iou.emptyStateUnreportedExpenseSubtitle')}
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
                    confirmButtonText={translate('iou.addUnreportedExpenseConfirm')}
                    onConfirm={() => {
                        if (selectedIds.size === 0) {
                            setErrorMessage(translate('iou.selectUnreportedExpense'));
                            return;
                        }
                        Navigation.goBack(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute()}));
                        changeTransactionsReport([...selectedIds], report?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID);
                        setErrorMessage('');
                    }}
                >
                    {!!errorMessage && (
                        <FormHelpMessage
                            style={[styles.mb2, styles.ph4]}
                            isError
                            message={errorMessage}
                        />
                    )}
                </SelectionList>
            )}
        </ScreenWrapper>
    );
}

AddUnreportedExpense.displayName = 'AddUnreportedExpense';

export default AddUnreportedExpense;
