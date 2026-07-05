import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import WidgetContainer from '@components/WidgetContainer';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import type {RecentlyAddedExpense} from './useRecentlyAddedData';

import EmptyState from './EmptyState';
import RecentlyAddedRow, {DATE_COLUMN_WIDTH, DATE_COLUMN_WIDTH_WIDE} from './RecentlyAddedRow';
import {useRecentlyAddedData} from './useRecentlyAddedData';

const HEADER_RECEIPT_ICON_SIZE = 16;

// The overflow button is sized to its icon so it doesn't inflate the centered widget header row;
// hitSlop keeps a comfortable tap target without adding visual height.
const OVERFLOW_MENU_HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

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
    // The hovered receipt preview is a portal on document.body, so it isn't dismissed by navigation alone.
    // Once the screen blurs (e.g. after opening an expense), we hide the preview instead of leaving it floating over the RHP.
    const isFocused = useIsFocused();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots', 'Receipt']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const {markReportRHPWidth} = useWideRHPActions();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isOverflowMenuVisible, setIsOverflowMenuVisible] = useState(false);
    const [overflowMenuPosition, setOverflowMenuPosition] = useState<AnchorPosition>();
    const overflowMenuButtonRef = useRef<View>(null);

    const hasExpenses = transactions.length > 0;

    // Mirror the Spend table: when any visible expense's date includes the year (a past-year date), widen the
    // shared date column so "Jun 7, 2025" isn't truncated. The header and every row use the same width to stay aligned.
    const shouldShowYear = transactions.some((expense) => DateUtils.doesDateBelongToAPastYear(expense.created));
    const dateColumnWidth = shouldShowYear ? DATE_COLUMN_WIDTH_WIDE : DATE_COLUMN_WIDTH;

    const openExpense = (expense: RecentlyAddedExpense) => {
        // Resolve only the tapped expense now. getReportIDToOpenForExpense may create a transaction thread, so
        // resolving every sibling up front would create a thread for each multi-expense sibling on a single tap.
        // Instead, seed the cheap snapshot-derived descriptors and let the carousel resolve each sibling lazily,
        // one at a time, only when the user actually navigates to it.
        const resolveContext = {introSelected, betas, currentUserEmail, currentUserAccountID};
        const reportID = getReportIDToOpenForExpense(expense, resolveContext);

        const siblingTransactionIDs = transactions.map((sibling) => sibling.transactionID);
        const siblingDescriptorsByTransactionID = transactions.reduce<Record<string, TransactionThreadNavigationDescriptor>>((map, sibling) => {
            // eslint-disable-next-line no-param-reassign
            map[sibling.transactionID] = {
                reportID: sibling.reportID,
                transaction: sibling.transaction,
                reportAction: sibling.reportAction,
                report: sibling.report,
            };
            return map;
        }, {});

        // Each row opens a single-expense view that always lands in (Wide) RHP on both layouts so the carousel
        // arrows are available. Marking the report as an expense lets the RHP open wide immediately, before its
        // data loads, instead of flickering from narrow to wide.
        setActiveTransactionIDs(siblingTransactionIDs, siblingDescriptorsByTransactionID).then(() => {
            markReportRHPWidth(reportID, 'wide');
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: ROUTES.HOME}));
        });
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

    // Guests (anonymous users) viewing a public room have no expenses of their own, so the section is hidden
    // entirely rather than showing the empty state.
    if (isAnonymousUser) {
        return null;
    }

    const overflowMenu = hasExpenses ? (
        <>
            <PressableWithoutFeedback
                ref={overflowMenuButtonRef}
                testID="recentlyAddedOverflowMenu"
                accessibilityLabel={translate('common.more')}
                sentryLabel="RecentlyAddedOverflowMenu"
                onPress={openOverflowMenu}
                hitSlop={OVERFLOW_MENU_HIT_SLOP}
                style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.threeDotsMenuIconWidth]}
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
                        shouldCallAfterModalHide: true,
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
                <View style={[shouldUseNarrowLayout ? [styles.mh5, styles.mb2] : [styles.mh8, styles.mb5], styles.br2, styles.overflowHidden]}>
                    {/* The column header only applies to the wide table layout; narrow rows use a stacked layout. */}
                    {!shouldUseNarrowLayout && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv2, styles.ph3, styles.borderBottom]}>
                            <View style={[StyleUtils.getWidthStyle(variables.w28), styles.alignItemsCenter, styles.justifyContentCenter]}>
                                <Icon
                                    src={icons.Receipt}
                                    fill={theme.icon}
                                    width={HEADER_RECEIPT_ICON_SIZE}
                                    height={HEADER_RECEIPT_ICON_SIZE}
                                />
                            </View>
                            <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)}>
                                <Text style={styles.textMicroSupporting}>{translate('common.type')}</Text>
                            </View>
                            <View style={StyleUtils.getWidthStyle(dateColumnWidth)}>
                                <Text style={styles.textMicroSupporting}>{translate('common.date')}</Text>
                            </View>
                            <Text style={[styles.flex1, styles.textMicroSupporting]}>{translate('common.merchant')}</Text>
                            <Text style={styles.textMicroSupporting}>{translate('iou.amount')}</Text>
                            <View style={StyleUtils.getWidthStyle(variables.iconSizeNormal)} />
                        </View>
                    )}
                    {transactions.map((expense, index) => (
                        <RecentlyAddedRow
                            key={expense.transactionID}
                            expense={expense}
                            onPress={() => openExpense(expense)}
                            shouldShowSeparator={index < transactions.length - 1}
                            shouldShowReceiptPreview={isFocused}
                            dateColumnWidth={dateColumnWidth}
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
