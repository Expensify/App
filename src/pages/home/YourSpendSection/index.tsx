import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import WidgetContainer from '@components/WidgetContainer';
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
import CardRow from './CardRow';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from './useYourSpendData';

const SKELETON_ROW_HEIGHT = 56;

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
