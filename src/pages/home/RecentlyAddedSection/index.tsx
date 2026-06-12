import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import EmptyState from './EmptyState';
import RecentlyAddedRow, {DATE_COLUMN_WIDTH, THUMBNAIL_COLUMN_WIDTH} from './RecentlyAddedRow';
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
    const [isOverflowMenuVisible, setIsOverflowMenuVisible] = useState(false);
    const [overflowMenuPosition, setOverflowMenuPosition] = useState<AnchorPosition>();
    const overflowMenuButtonRef = useRef<View>(null);

    const hasExpenses = transactions.length > 0;

    const openExpense = (reportID: string) => {
        if (shouldUseNarrowLayout) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME));
            return;
        }
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
                        <View style={[StyleUtils.getWidthStyle(THUMBNAIL_COLUMN_WIDTH), styles.alignItemsCenter, styles.justifyContentCenter]}>
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
                        <View style={StyleUtils.getWidthStyle(variables.iconSizeSmall)} />
                    </View>
                    {transactions.map((expense, index) => (
                        <RecentlyAddedRow
                            key={expense.transactionID}
                            expense={expense}
                            onPress={() => openExpense(expense.reportID)}
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
