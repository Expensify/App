import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import CardFeedIcon from '@components/CardFeedIcon';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import WidgetContainer from '@components/WidgetContainer';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayableExpensifyCards} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import RemainingLimitCircle from './RemainingLimitCircle';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from './useYourSpendData';

const SKELETON_ROW_HEIGHT = 56;

type CardRowProps = {
    cardRow: ReturnType<typeof useYourSpendData>['cardRows'][number];
    card: NonNullable<ReturnType<typeof getDisplayableExpensifyCards>[number]>;
    wrapperStyle: StyleProp<ViewStyle>;
};

function CardRow({cardRow, card, wrapperStyle}: CardRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {hovered, bind} = useHover();

    const unapprovedExpenseLimit = card.nameValuePairs?.unapprovedExpenseLimit;
    const hasLimitData = !!unapprovedExpenseLimit;
    const spentFraction = hasLimitData ? 1 - (card.availableSpend ?? 0) / unapprovedExpenseLimit : 0;
    const cardTotal = cardRow.total !== undefined ? convertToDisplayString(cardRow.total, cardRow.currency) : undefined;

    return (
        <View
            testID={`your-spend-card-row-${cardRow.cardID}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...bind}
        >
            <MenuItemWithTopDescription
                description={translate('homePage.yourSpend.recentTransactions', {lastFour: cardRow.lastFour})}
                title={cardTotal}
                titleStyle={styles.textBold}
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: cardRow.query}))}
                shouldShowRightComponent
                rightComponent={
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap3]}>
                        {hasLimitData && <RemainingLimitCircle spentFraction={spentFraction} />}
                        <View style={!hovered && styles.opacitySemiTransparent}>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    </View>
                }
                leftComponent={
                    <View style={[styles.justifyContentCenter, styles.h10]}>
                        <CardFeedIcon
                            isExpensifyCardFeed
                            iconProps={{
                                width: variables.cardIconWidth,
                                height: variables.cardIconHeight,
                                additionalStyles: [styles.overflowHidden, styles.br1],
                            }}
                        />
                    </View>
                }
                wrapperStyle={wrapperStyle}
                hasSubMenuItems
                shouldCheckActionAllowedOnPress={false}
            />
        </View>
    );
}

function YourSpendSection() {
    const {approvalRowState, approvalTotals, paymentRowState, paymentTotals, cardRows, awaitingApprovalQuery, repaidLast30DaysQuery} = useYourSpendData();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'ThumbsUpHourglass', 'MoneyBag']);

    const isVisible =
        approvalRowState === YOUR_SPEND_ROW_STATE.LOADING ||
        approvalRowState === YOUR_SPEND_ROW_STATE.READY ||
        paymentRowState === YOUR_SPEND_ROW_STATE.LOADING ||
        paymentRowState === YOUR_SPEND_ROW_STATE.READY ||
        cardRows.length > 0;

    if (!isVisible) {
        return null;
    }

    const wrapperStyle = [styles.alignItemsCenter, shouldUseNarrowLayout ? styles.ph5 : styles.ph8];

    return (
        <View testID="your-spend-section">
            <WidgetContainer
                title={translate('homePage.yourSpend.title')}
                containerStyles={[shouldUseNarrowLayout ? styles.pb2 : styles.pb5]}
            >
                {approvalRowState === YOUR_SPEND_ROW_STATE.LOADING && (
                    <View testID="your-spend-approval-skeleton">
                        <ItemListSkeletonView
                            fixedNumItems={1}
                            itemViewHeight={SKELETON_ROW_HEIGHT}
                            shouldAnimate
                            renderSkeletonItem={() => (
                                <SkeletonRect
                                    transform={[{translateX: shouldUseNarrowLayout ? 20 : 32}, {translateY: 20}]}
                                    width={160}
                                    height={12}
                                />
                            )}
                        />
                    </View>
                )}
                {approvalRowState === YOUR_SPEND_ROW_STATE.READY && (
                    <View testID="your-spend-approval-row">
                        <MenuItemWithTopDescription
                            description={translate('homePage.yourSpend.awaitingApproval')}
                            title={approvalTotals.total !== undefined ? convertToDisplayString(approvalTotals.total, approvalTotals.currency) : undefined}
                            titleStyle={styles.textBold}
                            onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: awaitingApprovalQuery}))}
                            shouldShowRightIcon
                            leftComponent={
                                <View style={styles.getWidgetItemIconContainerStyle(theme.border)}>
                                    <Icon
                                        src={icons.ThumbsUpHourglass}
                                        fill={theme.icon}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                    />
                                </View>
                            }
                            wrapperStyle={wrapperStyle}
                            shouldCheckActionAllowedOnPress={false}
                        />
                    </View>
                )}

                {paymentRowState === YOUR_SPEND_ROW_STATE.LOADING && (
                    <View testID="your-spend-payment-skeleton">
                        <ItemListSkeletonView
                            fixedNumItems={1}
                            itemViewHeight={SKELETON_ROW_HEIGHT}
                            shouldAnimate
                            renderSkeletonItem={() => (
                                <SkeletonRect
                                    transform={[{translateX: shouldUseNarrowLayout ? 20 : 32}, {translateY: 20}]}
                                    width={200}
                                    height={12}
                                />
                            )}
                        />
                    </View>
                )}
                {paymentRowState === YOUR_SPEND_ROW_STATE.READY && (
                    <View testID="your-spend-payment-row">
                        <MenuItemWithTopDescription
                            description={translate('homePage.yourSpend.repaidLast30Days')}
                            title={paymentTotals.total !== undefined ? convertToDisplayString(paymentTotals.total, paymentTotals.currency) : undefined}
                            titleStyle={styles.textBold}
                            onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: repaidLast30DaysQuery}))}
                            shouldShowRightIcon
                            leftComponent={
                                <View style={styles.getWidgetItemIconContainerStyle(theme.border)}>
                                    <Icon
                                        src={icons.MoneyBag}
                                        fill={theme.icon}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                    />
                                </View>
                            }
                            wrapperStyle={wrapperStyle}
                            shouldCheckActionAllowedOnPress={false}
                        />
                    </View>
                )}

                {cardRows.map((cardRow) => {
                    const card = getDisplayableExpensifyCards(cardList).find((c) => c.cardID === cardRow.cardID);
                    if (!card) {
                        return null;
                    }
                    return (
                        <CardRow
                            key={cardRow.cardID}
                            cardRow={cardRow}
                            card={card}
                            wrapperStyle={wrapperStyle}
                        />
                    );
                })}
            </WidgetContainer>
        </View>
    );
}

YourSpendSection.displayName = 'YourSpendSection';

export default YourSpendSection;
