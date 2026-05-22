import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import CardFeedIcon from '@components/CardFeedIcon';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import RemainingLimitCircle from './RemainingLimitCircle';
import type {useYourSpendData} from './useYourSpendData';

type CardRowProps = {
    cardRow: ReturnType<typeof useYourSpendData>['cardRows'][number];
    wrapperStyle: StyleProp<ViewStyle>;
};

function CardRow({cardRow, wrapperStyle}: CardRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {hovered, bind} = useHover();
    const {onMouseEnter, onMouseLeave} = bind;

    const cardTotal = cardRow.total !== undefined ? convertToDisplayString(cardRow.total, cardRow.currency) : undefined;

    return (
        <View
            testID={`your-spend-card-row-${cardRow.cardID}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <MenuItemWithTopDescription
                description={translate('homePage.yourSpend.recentTransactions', {lastFour: cardRow.lastFour})}
                title={cardTotal}
                titleStyle={styles.textBold}
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: cardRow.query}))}
                shouldShowRightComponent
                rightComponent={
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap3]}>
                        {cardRow.spentFraction !== undefined && <RemainingLimitCircle spentFraction={cardRow.spentFraction} />}
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

export default CardRow;
