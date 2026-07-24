import CardFeedIcon from '@components/CardFeedIcon';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardFeedWithDomainID} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {useYourSpendData} from './useYourSpendData';

import RemainingLimitCircle from './RemainingLimitCircle';
import {YOUR_SPEND_CARD_KIND} from './useYourSpendData';

type CardRowProps = {
    cardRow: ReturnType<typeof useYourSpendData>['cardRows'][number];
    wrapperStyle: StyleProp<ViewStyle>;
};

function CardRow({cardRow, wrapperStyle}: CardRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {hovered, bind} = useHover();
    const {onMouseEnter, onMouseLeave} = bind;

    const cardTotal = cardRow.total !== undefined ? convertToDisplayString(cardRow.total, cardRow.currency) : undefined;

    // Pick the artwork branch up front so the JSX below stays readable.
    // - Expensify Card: keep the existing illustrated feed icon.
    // - Personal Plaid/CSV card (`isPersonal`): pass the bare `bank` (`plaid.ins_…`)
    //   directly. `CardFeedIcon` resolves the Plaid institution icon internally via
    //   `getPlaidInstitutionId(selectedFeed)`.
    // - Employer-feed company card: key the icon by `feed|domainID`.
    const iconProps = {
        width: variables.cardIconWidth,
        height: variables.cardIconHeight,
        additionalStyles: [styles.overflowHidden, styles.br1],
    };
    let leftIcon: React.ReactElement;
    if (cardRow.kind === YOUR_SPEND_CARD_KIND.EXPENSIFY) {
        leftIcon = (
            <CardFeedIcon
                isExpensifyCardFeed
                iconProps={iconProps}
            />
        );
    } else if (cardRow.isPersonal || cardRow.fundID === undefined) {
        leftIcon = (
            <CardFeedIcon
                selectedFeed={cardRow.bank}
                iconProps={iconProps}
            />
        );
    } else {
        leftIcon = (
            <CardFeedIcon
                selectedFeed={getCardFeedWithDomainID(cardRow.bank, cardRow.fundID)}
                iconProps={iconProps}
            />
        );
    }

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
                leftComponent={<View style={[styles.justifyContentCenter, styles.h10]}>{leftIcon}</View>}
                wrapperStyle={wrapperStyle}
                hasSubMenuItems
                shouldCheckActionAllowedOnPress={false}
            />
        </View>
    );
}

export default CardRow;
