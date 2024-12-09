import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/CardListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {Section} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const currentCards = searchAdvancedFiltersForm?.cardID;
    const [newCards, setNewCards] = useState(currentCards ?? []);

    const sections = useMemo(() => {
        const newSections: Section[] = [];
        const cards = Object.values(cardList ?? {})
            .sort((a, b) => a.bank.localeCompare(b.bank))
            .map((card) => {
                const icon = CardUtils.getCardFeedIcon(card?.bank as CompanyCardFeed);
                const cardName = card?.nameValuePairs?.cardTitle ?? card?.cardName;
                const text = card.bank === CONST.EXPENSIFY_CARD.BANK ? card.bank : cardName;

                return {
                    lastFourPAN: card.lastFourPAN,
                    isVirtual: card?.nameValuePairs?.isVirtual,
                    text,
                    keyForList: card.cardID.toString(),
                    isSelected: newCards.includes(card.cardID.toString()),
                    bankIcon: {
                        icon,
                        iconWidth: variables.cardIconWidth,
                        iconHeight: variables.cardIconHeight,
                        iconStyles: [styles.cardIcon],
                    },
                };
            });
        newSections.push({
            title: undefined,
            data: cards,
            shouldShow: cards.length > 0,
        });
        return newSections;
    }, [cardList, styles, newCards]);

    const handleConfirmSelection = useCallback(() => {
        SearchActions.updateAdvancedFilters({
            cardID: newCards,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [newCards]);

    const updateNewCards = useCallback(
        (item: Partial<OptionData>) => {
            if (!item.keyForList) {
                return;
            }
            if (item.isSelected) {
                setNewCards(newCards.filter((card) => card !== item.keyForList));
            } else {
                setNewCards([...newCards, item.keyForList]);
            }
        },
        [newCards],
    );

    const footerContent = useMemo(
        () => (
            <Button
                success
                text={translate('common.save')}
                pressOnEnter
                onPress={handleConfirmSelection}
                large
            />
        ),
        [translate, handleConfirmSelection],
    );

    return (
        <ScreenWrapper
            testID={SearchFiltersCardPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.card')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    sections={sections}
                    onSelectRow={updateNewCards}
                    footerContent={footerContent}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={CardListItem}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';

export default SearchFiltersCardPage;
