import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
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
                <SpendSummaryRow
                    state={approvalRowState}
                    testIDPrefix="your-spend-approval"
                    description={translate('homePage.yourSpend.awaitingApproval')}
                    totals={approvalTotals}
                    iconSrc={icons.ThumbsUpHourglass}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: awaitingApprovalQuery}))}
                    wrapperStyle={wrapperStyle}
                />

                <SpendSummaryRow
                    state={paymentRowState}
                    testIDPrefix="your-spend-payment"
                    description={translate('homePage.yourSpend.repaidLast30Days')}
                    totals={paymentTotals}
                    iconSrc={icons.MoneyBag}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: repaidLast30DaysQuery}))}
                    wrapperStyle={wrapperStyle}
                />

                {cardRows.map((cardRow) => (
                    <CardRow
                        key={cardRow.cardID}
                        cardRow={cardRow}
                        wrapperStyle={wrapperStyle}
                    />
                ))}
            </WidgetContainer>
        </View>
    );
}

YourSpendSection.displayName = 'YourSpendSection';

export default YourSpendSection;
