import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState, memo, lazy, Suspense} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {deleteMoneyRequest, deleteTrackExpense, initSplitExpense} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportActions, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {changeMoneyRequestHoldStatus, isSelfDM, navigateToDetailsPage} from '@libs/ReportUtils';
import {
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    hasReceipt,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import LoadingBar from './LoadingBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportTransactionsNavigation from './MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

type StatusFlags = {
    isOnHold: boolean;
    isDuplicate: boolean;
    isScanning: boolean;
    hasPendingRTERViolation: boolean;
    shouldShowBrokenConnectionViolation: boolean;
    isPendingExpensifyCard: boolean;
};

// Lazy load heavy components to improve initial render time
const LazyBrokenConnectionDescription = lazy(() => import('./BrokenConnectionDescription'));

// Pre-create static status icons to avoid recreation on every render
const createStatusIcon = (src: IconAsset) => memo(({theme}: {theme: {icon: string}}) => (
    <Icon
        src={src}
        height={variables.iconSizeSmall}
        width={variables.iconSizeSmall}
        fill={theme.icon}
    />
));

const StopwatchIcon = createStatusIcon(Expensicons.Stopwatch);
const FlagIcon = createStatusIcon(Expensicons.Flag);
const CreditCardHourglassIcon = createStatusIcon(Expensicons.CreditCardHourglass);
const HourglassIcon = createStatusIcon(Expensicons.Hourglass);
const ReceiptScanIcon = createStatusIcon(Expensicons.ReceiptScan);

// Fallback component for lazy loaded components
const StatusBarFallback = memo(() => <View style={{height: 20}} />);

// Memoized status computation component to isolate expensive calculations
const StatusComputation = memo(({
    transaction,
    transactionViolations,
    parentReport,
    policy,
    onStatusChange,
}: {
    transaction: OnyxEntry<Transaction>;
    transactionViolations: TransactionViolation[] | undefined;
    parentReport: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    onStatusChange: (flags: StatusFlags) => void;
}) => {
    const statusFlags = useMemo((): StatusFlags => {
        if (!transaction) {
            return {
                isOnHold: false,
                isDuplicate: false,
                isScanning: false,
                hasPendingRTERViolation: false,
                shouldShowBrokenConnectionViolation: false,
                isPendingExpensifyCard: false,
            };
        }
        
        return {
            isOnHold: isOnHoldTransactionUtils(transaction),
            isDuplicate: isDuplicateTransactionUtils(transaction?.transactionID),
            isScanning: hasReceipt(transaction) && isReceiptBeingScanned(transaction),
            hasPendingRTERViolation: hasPendingRTERViolationTransactionUtils(transactionViolations ?? []),
            shouldShowBrokenConnectionViolation: shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations ?? []),
            isPendingExpensifyCard: isExpensifyCardTransaction(transaction) && isPending(transaction),
        };
    }, [transaction, transactionViolations, parentReport, policy]);

    useEffect(() => {
        onStatusChange(statusFlags);
    }, [statusFlags, onStatusChange]);

    return null;
});

function MoneyRequestHeader({report, parentReportAction, policy, onBackButtonPress}: MoneyRequestHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const theme = useTheme();
    
    // Extract transaction ID early to optimize Onyx queries
    const transactionID = useMemo(() => {
        if (!isMoneyRequestAction(parentReportAction)) {
            return CONST.DEFAULT_NUMBER_ID;
        }
        return getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID;
    }, [parentReportAction]);

    const reportID = report?.reportID;
    const parentReportID = report?.parentReportID;

    // Simplified Onyx queries without complex selectors
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {
        canBeMissing: false,
    });
    
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID
        }`,
        {canBeMissing: true},
    );
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [statusFlags, setStatusFlags] = useState<StatusFlags>({
        isOnHold: false,
        isDuplicate: false,
        isScanning: false,
        hasPendingRTERViolation: false,
        shouldShowBrokenConnectionViolation: false,
        isPendingExpensifyCard: false,
    });

    // Defer heavy onyx loading for better initial render
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {
        initialValue: true, 
        canBeMissing: false,
    });
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Memoize callback for status changes
    const handleStatusChange = useCallback((flags: StatusFlags) => {
        setStatusFlags(flags);
    }, []);
    
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction?.transactionID);
    const reportID = report?.reportID;
    const {isBetaEnabled} = usePermissions();

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);

    // If the parent report is a selfDM, it should always be opened in the Inbox tab
    const shouldOpenParentReportInCurrentTab = !isSelfDM(parentReport);

    const markAsCash = useCallback(() => {
        markAsCashAction(transaction?.transactionID, reportID);
    }, [reportID, transaction?.transactionID]);

    // Pre-create status icons with theme to avoid recreation
    const statusIcons = useMemo(() => ({
        stopwatch: <StopwatchIcon theme={theme} />,
        flag: <FlagIcon theme={theme} />,
        creditCardHourglass: <CreditCardHourglassIcon theme={theme} />,
        hourglass: <HourglassIcon theme={theme} />,
        receiptScan: <ReceiptScanIcon theme={theme} />,
    }), [theme]);

    const getStatusBarProps = useCallback((): MoneyRequestHeaderStatusBarProps | undefined => {
        if (statusFlags.isOnHold) {
            return {icon: statusIcons.stopwatch, description: translate('iou.expenseOnHold')};
        }

        if (statusFlags.isDuplicate) {
            return {icon: statusIcons.flag, description: translate('iou.expenseDuplicate')};
        }

        if (statusFlags.isPendingExpensifyCard) {
            return {icon: statusIcons.creditCardHourglass, description: translate('iou.transactionPendingDescription')};
        }
        
        if (statusFlags.shouldShowBrokenConnectionViolation) {
            return {
                icon: statusIcons.hourglass,
                description: (
                    <Suspense fallback={<StatusBarFallback />}>
                        <LazyBrokenConnectionDescription
                            transactionID={transaction?.transactionID}
                            report={parentReport}
                            policy={policy}
                        />
                    </Suspense>
                ),
            };
        }
        
        if (statusFlags.hasPendingRTERViolation) {
            return {icon: statusIcons.hourglass, description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        
        if (statusFlags.isScanning) {
            return {icon: statusIcons.receiptScan, description: translate('iou.receiptScanInProgressDescription')};
        }
        
        return undefined;
    }, [statusFlags, statusIcons, translate, transaction?.transactionID, parentReport, policy]);

    const statusBarProps = useMemo(() => getStatusBarProps(), [getStatusBarProps]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !statusFlags.isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, statusFlags.isOnHold]);

    // Defer primary action calculation until needed and memoize heavily
    const primaryAction = useMemo(() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(report, parentReport, transaction, transactionViolations, policy);
    }, [parentReport, policy, report, transaction, transactionViolations]);

    // Memoize primary action implementation to prevent recreation
    const primaryActionImplementation = useMemo(() => ({
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    changeMoneyRequestHoldStatus(parentReportAction);
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                onPress={() => {
                    if (!reportID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                onPress={markAsCash}
            />
        ),
    }), [translate, parentReportAction, reportID, markAsCash]);

    // Get report actions for secondary actions calculation
    const reportActions = useMemo(() => {
        if (!parentReport) {
            return {};
        }
        return getReportActions(parentReport) || {};
    }, [parentReport]);

    // Optimize secondary actions calculation with better memoization and lazy loading
    const secondaryActions = useMemo(() => {
        if (!transaction || !parentReport || !reportActions) {
            return [];
        }
        return getSecondaryTransactionThreadActions(parentReport, transaction, Object.values(reportActions), policy, isBetaEnabled(CONST.BETAS.NEW_DOT_SPLITS));
    }, [isBetaEnabled, parentReport, policy, transaction]);

    // Memoize secondary actions implementation
    const secondaryActionsImplementation = useMemo((): Record<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>>> => ({
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD,
            onSelected: () => {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }
                changeMoneyRequestHoldStatus(parentReportAction);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT]: {
            text: translate('iou.split'),
            icon: Expensicons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: () => {
                initSplitExpense(transaction, reportID ?? String(CONST.DEFAULT_NUMBER_ID));
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: () => {
                navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                setIsDeleteModalVisible(true);
            },
        },
    }), [translate, parentReportAction, report]);

    // Memoize applicable secondary actions
    const applicableSecondaryActions = useMemo(
        () => secondaryActions.map((action) => secondaryActionsImplementation[action]),
        [secondaryActions, secondaryActionsImplementation]
    );

    // Memoize header report object
    const headerReport = useMemo(() => {
        if (!reportID) {
            return undefined;
        }
        return {
            ...report,
            reportID,
            ownerAccountID: parentReport?.ownerAccountID,
        };
    }, [report, reportID, parentReport?.ownerAccountID]);

    // Render action buttons separately to avoid recreation
    const renderActionButtons = useMemo(() => (
        <View style={[styles.flexRow, styles.gap2]}>
            {!!primaryAction && primaryActionImplementation[primaryAction]}
            {!!applicableSecondaryActions.length && (
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                />
            )}
        </View>
    ), [primaryAction, primaryActionImplementation, applicableSecondaryActions, translate, styles]);

    const renderNarrowActionButtons = useMemo(() => (
        <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
            {!!primaryAction && <View style={[styles.flexGrow4]}>{primaryActionImplementation[primaryAction]}</View>}
            {!!applicableSecondaryActions.length && (
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                    wrapperStyle={[!primaryAction && styles.flexGrow4]}
                />
            )}
        </View>
    ), [primaryAction, primaryActionImplementation, applicableSecondaryActions, translate, styles]);

    return (
        <View style={[styles.pl0, styles.borderBottom]}>
            {/* Isolate expensive status computation */}
            <StatusComputation
                transaction={transaction}
                transactionViolations={transactionViolations}
                parentReport={parentReport}
                policy={policy}
                onStatusChange={handleStatusChange}
            />
            
            <HeaderWithBackButton
                shouldShowBorderBottom={false}
                shouldShowReportAvatarWithDisplay
                shouldShowPinButton={false}
                report={headerReport}
                policy={policy}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter={!isReportInRHP}
                shouldDisplayHelpButton={!isReportInRHP}
                onBackButtonPress={onBackButtonPress}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab={shouldOpenParentReportInCurrentTab}
            >
                {!shouldUseNarrowLayout && renderActionButtons}
                {shouldDisplayTransactionNavigation && <MoneyRequestReportTransactionsNavigation currentReportID={reportID} />}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && renderNarrowActionButtons}
            {!!statusBarProps && (
                <View style={[styles.ph5, styles.pb3]}>
                    <MoneyRequestHeaderStatusBar
                        icon={statusBarProps.icon}
                        description={statusBarProps.description}
                    />
                </View>
            )}
            <LoadingBar shouldShow={(isLoadingReportData && shouldUseNarrowLayout) ?? false} />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                title={translate('iou.deleteExpense', {count: 1})}
                isVisible={isDeleteModalVisible}
                onConfirm={() => {
                    setIsDeleteModalVisible(false);
                    if (!parentReportAction || !transaction) {
                        throw new Error('Data missing');
                    }
                    if (isTrackExpenseAction(parentReportAction)) {
                        deleteTrackExpense(report?.chatReportID, transaction.transactionID, parentReportAction, true);
                    } else {
                        deleteMoneyRequest(transaction.transactionID, parentReportAction, true);
                    }
                    onBackButtonPress();
                }}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation', {count: 1})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
