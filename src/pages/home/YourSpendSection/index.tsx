import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import HomeSectionExpandToggle from '@pages/home/HomeSectionExpandToggle';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import CardRow from './CardRow';
import SpendSummaryRow from './SpendSummaryRow';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from './useYourSpendData';

function YourSpendSection() {
    const {approvalRowState, approvalTotals, paymentRowState, paymentTotals, cardRows, awaitingApprovalQuery, repaidLast30DaysQuery} = useYourSpendData();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ThumbsUpHourglass', 'MoneyBag']);
    const [isExpanded, setIsExpanded] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => setIsExpanded(false);
        }, []),
    );

    const isApprovalRowVisible = approvalRowState === YOUR_SPEND_ROW_STATE.LOADING || approvalRowState === YOUR_SPEND_ROW_STATE.READY;
    const isPaymentRowVisible = paymentRowState === YOUR_SPEND_ROW_STATE.LOADING || paymentRowState === YOUR_SPEND_ROW_STATE.READY;
    const isVisible = isApprovalRowVisible || isPaymentRowVisible || cardRows.length > 0;

    if (!isVisible) {
        return null;
    }

    const wrapperStyle = [styles.alignItemsCenter, shouldUseNarrowLayout ? styles.ph5 : styles.ph8];
    const visibleSummaryRowsCount = (isApprovalRowVisible ? 1 : 0) + (isPaymentRowVisible ? 1 : 0);
    const cardLimit = Math.max(0, CONST.HOME.SECTION_VISIBLE_LIMIT - visibleSummaryRowsCount);
    const hiddenCount = Math.max(0, cardRows.length - cardLimit);
    const visibleCardRows = isExpanded ? cardRows : cardRows.slice(0, cardLimit);

    return (
        <View testID="your-spend-section">
            <WidgetContainer
                title={translate('homePage.yourSpend.title')}
                containerStyles={[shouldUseNarrowLayout ? styles.pb2 : styles.pb5]}
            >
                <SpendSummaryRow
                    state={approvalRowState}
                    testIDPrefix="your-spend-approval"
                    description={translate('homePage.yourSpend.awaitingApproval')}
                    totals={approvalTotals}
                    iconSrc={icons.ThumbsUpHourglass}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: awaitingApprovalQuery}))}
                    wrapperStyle={wrapperStyle}
                    skeletonRowIndex={0}
                />

                <SpendSummaryRow
                    state={paymentRowState}
                    testIDPrefix="your-spend-payment"
                    description={translate('homePage.yourSpend.repaidLast30Days')}
                    totals={paymentTotals}
                    iconSrc={icons.MoneyBag}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: repaidLast30DaysQuery}))}
                    wrapperStyle={wrapperStyle}
                    skeletonRowIndex={1}
                />

                {visibleCardRows.map((cardRow) => (
                    <CardRow
                        key={cardRow.cardID}
                        cardRow={cardRow}
                        wrapperStyle={wrapperStyle}
                    />
                ))}
                {hiddenCount > 0 && (
                    <HomeSectionExpandToggle
                        isExpanded={isExpanded}
                        onPress={() => setIsExpanded((prev) => !prev)}
                        collapsedLabel={translate('homePage.seeMore', {count: hiddenCount})}
                    />
                )}
            </WidgetContainer>
        </View>
    );
}

export default YourSpendSection;
