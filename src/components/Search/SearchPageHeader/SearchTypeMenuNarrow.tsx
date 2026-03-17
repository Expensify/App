import React, {useRef} from 'react';
import {ScrollView} from 'react-native';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import SearchTypeMenuItem from '@pages/Search/SearchTypeMenuItem';
import ROUTES from '@src/ROUTES';

type SearchTypeMenuNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchTypeMenuNarrow({queryJSON}: SearchTypeMenuNarrowProps) {
    const {hash, similarSearchHash} = queryJSON ?? {};
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections({hash, similarSearchHash});
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Basket',
        'CalendarSolid',
        'Receipt',
        'ChatBubbles',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'ExpensifyCard',
        'Bank',
        'User',
        'Folder',
    ] as const);
    const {clearSelectedTransactions} = useSearchActionsContext();
    const scrollRef = useRef<ScrollView>(null);
    const isScrolledRef = useRef(false);

    const handleTypeMenuItemPress = singleExecution((searchQuery: string) => {
        clearSelectedTransactions();
        setSearchContext(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
    });

    const sectionStartIndices = [0];
    for (const section of typeMenuSections) {
        sectionStartIndices.push((sectionStartIndices.at(-1) ?? 0) + section.menuItems.length);
    }

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            contentContainerStyle={[styles.ph5]}
            showsHorizontalScrollIndicator={false}
        >
            {typeMenuSections.map((section, sectionIndex) =>
                section.translationPath === 'search.savedSearchesMenuItemTitle'
                    ? null
                    : section.menuItems.map((item, itemIndex) => {
                          const flattenedIndex = (sectionStartIndices?.at(sectionIndex) ?? 0) + itemIndex;
                          const focused = activeItemIndex === flattenedIndex;
                          const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;

                          return (
                              <SearchTypeMenuItem
                                  key={item.key}
                                  title={translate(item.translationPath)}
                                  icon={icon}
                                  focused={focused}
                                  onPress={() => handleTypeMenuItemPress(item.searchQuery)}
                                  onLayout={(e) => {
                                      if (!focused || isScrolledRef.current || !('left' in e.nativeEvent.layout)) {
                                          return;
                                      }
                                      isScrolledRef.current = true;
                                      scrollRef.current?.scrollTo({x: (e.nativeEvent.layout.left as number) - styles.pl5.paddingLeft});
                                  }}
                              />
                          );
                      }),
            )}
        </ScrollView>
    );
}

export default SearchTypeMenuNarrow;
