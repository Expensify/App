import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import WidgetContainer from '@components/WidgetContainer';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {createTransactionThreadReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isOneTransactionReport} from '@libs/ReportUtils';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import EmptyState from './EmptyState';
import RecentlyAddedRow, {DATE_COLUMN_WIDTH, getThumbnailColumnWidth} from './RecentlyAddedRow';
import type {RecentlyAddedExpense} from './useRecentlyAddedData';
import {useRecentlyAddedData} from './useRecentlyAddedData';

const HEADER_RECEIPT_ICON_SIZE = 16;

const OVERFLOW_MENU_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

function RecentlyAddedSection() {
    const {transactions} = useRecentlyAddedData();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots', 'Receipt']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const {markReportIDAsExpense} = useWideRHPActions();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isOverflowMenuVisible, setIsOverflowMenuVisible] = useState(false);
    const [overflowMenuPosition, setOverflowMenuPosition] = useState<AnchorPosition>();
    const overflowMenuButtonRef = useRef<View>(null);

    const hasExpenses = transactions.length > 0;

    // Each row is a single expense, so we open that specific expense rather than its parent report.
    // A one-transaction report already renders the expense inline, so we keep its reportID; for a
    // multi-expense report we resolve (and create if needed) the transaction thread for the tapped expense.
    const getReportIDToOpen = (expense: RecentlyAddedExpense): string => {
        const isUnreported = expense.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        // Unreported (tracked) expenses live in the self-DM; their transaction thread (resolved from the
        // snapshot) is the expense view to open, since report "0" does not exist.
        if (isUnreported) {
            return expense.threadReportID ?? expense.reportID;
        }

        const parentReport = getReportOrDraftReport(expense.reportID);
        if (isOneTransactionReport(parentReport)) {
            return expense.reportID;
        }

        // Prefer the transaction thread resolved from the Search snapshot. The main reportActions_ collection
        // may be empty (e.g. right after clearing Onyx) so getIOUActionForReportID can fail and incorrectly
        // fall back to the whole parent expense report; the snapshot already carries the correct childReportID.
        if (expense.threadReportID) {
            return expense.threadReportID;
        }

        const iouAction = getIOUActionForReportID(expense.reportID, expense.transactionID);
        if (!iouAction) {
            return expense.reportID;
        }
        if (iouAction.childReportID) {
            return iouAction.childReportID;
        }

        const transactionThreadReport = createTransactionThreadReport({
            introSelected,
            currentUserLogin: currentUserEmail ?? '',
            currentUserAccountID,
            betas,
            iouReport: parentReport,
            iouReportAction: iouAction,
            transaction: expense.transaction,
        });
        return transactionThreadReport?.reportID ?? expense.reportID;
    };

    const openExpense = (expense: RecentlyAddedExpense) => {
        const reportID = getReportIDToOpen(expense);
        if (shouldUseNarrowLayout) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME));
            return;
        }
        // Each row opens a single-expense view that always lands in Wide RHP. Marking the report as an expense
        // lets the RHP open wide immediately, before its data loads, instead of flickering from narrow to wide.
        markReportIDAsExpense(reportID);
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: ROUTES.HOME}));
    };

    const openOverflowMenu = () => {
        calculatePopoverPosition(overflowMenuButtonRef, OVERFLOW_MENU_ANCHOR_ALIGNMENT).then((position) => {
            setOverflowMenuPosition(position);
            setIsOverflowMenuVisible(true);
        });
    };

    const navigateToExpensesPage = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({type: CONST.SEARCH.DATA_TYPES.EXPENSE}),
            }),
        );
    };

    const overflowMenu = hasExpenses ? (
        <>
            <PressableWithoutFeedback
                ref={overflowMenuButtonRef}
                testID="recentlyAddedOverflowMenu"
                accessibilityLabel={translate('common.more')}
                sentryLabel="RecentlyAddedOverflowMenu"
                onPress={openOverflowMenu}
                style={[styles.touchableButtonImage, styles.threeDotsMenuIconWidth]}
            >
                <Icon
                    src={icons.ThreeDots}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
            <PopoverMenu
                isVisible={isOverflowMenuVisible}
                anchorRef={overflowMenuButtonRef}
                anchorPosition={overflowMenuPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={OVERFLOW_MENU_ANCHOR_ALIGNMENT}
                onClose={() => setIsOverflowMenuVisible(false)}
                onItemSelected={() => setIsOverflowMenuVisible(false)}
                menuItems={[
                    {
                        text: translate('homePage.recentlyAddedSection.viewAll'),
                        icon: icons.Receipt,
                        onSelected: navigateToExpensesPage,
                    },
                ]}
            />
        </>
    ) : undefined;

    return (
        <WidgetContainer
            title={translate('homePage.recentlyAddedSection.title')}
            titleRightContent={overflowMenu}
        >
            {hasExpenses ? (
                // The rounded, clipped table wraps the header + rows so a hovered first/last row gets its corners
                // clipped to the table's radius, while the hover background still spans the full row width.
                <View style={[shouldUseNarrowLayout ? styles.mh5 : styles.mh8, shouldUseNarrowLayout ? styles.mb2 : styles.mb5, styles.br2, styles.overflowHidden]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv2, styles.ph3, styles.borderBottom]}>
                        <View style={[StyleUtils.getWidthStyle(getThumbnailColumnWidth(shouldUseNarrowLayout)), styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <Icon
                                src={icons.Receipt}
                                fill={theme.icon}
                                width={HEADER_RECEIPT_ICON_SIZE}
                                height={HEADER_RECEIPT_ICON_SIZE}
                            />
                        </View>
                        <View style={StyleUtils.getWidthStyle(DATE_COLUMN_WIDTH)}>
                            <Text style={[styles.textMicroSupporting, styles.textStrong]}>{translate('common.date')}</Text>
                        </View>
                        <Text style={[styles.flex1, styles.textMicroSupporting]}>{translate('common.merchant')}</Text>
                        <Text style={[styles.textMicroSupporting]}>{translate('iou.amount')}</Text>
                        <View style={StyleUtils.getWidthStyle(variables.iconSizeNormal)} />
                    </View>
                    {transactions.map((expense, index) => (
                        <RecentlyAddedRow
                            key={expense.transactionID}
                            expense={expense}
                            onPress={() => openExpense(expense)}
                            shouldShowSeparator={index < transactions.length - 1}
                        />
                    ))}
                </View>
            ) : (
                <EmptyState />
            )}
        </WidgetContainer>
    );
}

export default RecentlyAddedSection;
