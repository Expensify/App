import React, {useMemo} from 'react';
import {View} from 'react-native';
import CardFeedIcon from '@components/CardFeedIcon';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import WidgetContainer from '@components/WidgetContainer';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDescription, getDisplayableExpensifyCards} from '@libs/CardUtils';
import {convertToDisplayString, getCurrencyKeyByCountryCode} from '@libs/CurrencyUtils';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import RemainingLimitCircle from './RemainingLimitCircle';

function AssignedCardsSection() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const {currencyList} = useCurrencyListState();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const displayableCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);

    if (displayableCards.length === 0) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate('homePage.assignedCards')}
            containerStyles={[shouldUseNarrowLayout ? styles.pb2 : styles.pb5]}
        >
            {displayableCards.map((card) => {
                const customTitle = card.nameValuePairs?.cardTitle;
                const description = customTitle && card.lastFourPAN ? `${customTitle} ${CONST.DOT_SEPARATOR} ${card.lastFourPAN}` : (customTitle ?? getCardDescription(card, translate));
                const currency = getCurrencyKeyByCountryCode(currencyList, card.nameValuePairs?.country ?? card.nameValuePairs?.feedCountry);
                const formattedAvailableSpend = convertToDisplayString(card.availableSpend, currency);
                const title = translate('homePage.assignedCardsRemaining', {amount: formattedAvailableSpend});

                const unapprovedExpenseLimit = card.nameValuePairs?.unapprovedExpenseLimit;
                const hasLimitData = !!unapprovedExpenseLimit;
                const spentFraction = hasLimitData ? 1 - (card.availableSpend ?? 0) / unapprovedExpenseLimit : 0;

                return (
                    <Hoverable key={card.cardID}>
                        {(isHovered) => (
                            <View>
                                <MenuItemWithTopDescription
                                    title={title}
                                    titleStyle={styles.textBold}
                                    description={description}
                                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(card.cardID)))}
                                    shouldShowRightComponent
                                    rightComponent={
                                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                            {hasLimitData && <RemainingLimitCircle spentFraction={spentFraction} />}
                                            <Icon
                                                src={icons.ArrowRight}
                                                fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                                                width={variables.iconSizeSmall}
                                                height={variables.iconSizeSmall}
                                                additionalStyles={styles.opacitySemiTransparent}
                                            />
                                        </View>
                                    }
                                    leftComponent={
                                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                                            <CardFeedIcon
                                                isExpensifyCardFeed
                                                iconProps={{width: variables.cardIconWidth, height: variables.cardIconHeight, additionalStyles: [styles.overflowHidden, styles.br1]}}
                                            />
                                        </View>
                                    }
                                    wrapperStyle={[styles.alignItemsCenter, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}
                                    hasSubMenuItems
                                    viewMode={CONST.OPTION_MODE.COMPACT}
                                    shouldCheckActionAllowedOnPress={false}
                                />
                            </View>
                        )}
                    </Hoverable>
                );
            })}
        </WidgetContainer>
    );
}

export default AssignedCardsSection;
