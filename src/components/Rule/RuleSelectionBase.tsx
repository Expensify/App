import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';

type SelectionItem = {
    name: string;
    value: string;
};

type RuleSelectionBackToRoute = Route | ((selectedValue?: string) => Route);

type RuleSelectionBaseProps = {
    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** The translated page title */
    title?: string;

    /** Test ID for the screen wrapper */
    testID: string;

    /** The currently selected item */
    selectedItem?: SelectionItem;

    /** The list of items to display */
    items: SelectionItem[];

    /** Callback when a value is selected */
    onSave: (value?: string) => void;

    /** Callback to go back */
    onBack: () => void;

    /** The route to navigate back to */
    backToRoute: RuleSelectionBackToRoute;

    /** When true, shows a "None" option in the picker */
    allowNoneOption?: boolean;

    /** Optional hash for rule not found validation */
    hash?: string;
};

function resolveBackToRoute(backToRoute: RuleSelectionBackToRoute, selectedValue?: string): Route {
    return typeof backToRoute === 'function' ? backToRoute(selectedValue) : backToRoute;
}

function RuleSelectionBase({titleKey, title, testID, selectedItem, items, onSave, onBack, backToRoute, allowNoneOption = true, hash}: RuleSelectionBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleSaveSelection = (value?: string) => {
        onSave(value);
        Navigation.goBack(resolveBackToRoute(backToRoute, value));
    };

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={title ?? translate(titleKey)}
                    onBackButtonPress={onBack}
                />
                <View style={[styles.flex1]}>
                    <SearchSingleSelectionPicker
                        initiallySelectedItem={selectedItem}
                        items={items}
                        onSaveSelection={handleSaveSelection}
                        shouldAutoSave
                        shouldNavigateOnSave={false}
                        allowNoneOption={allowNoneOption}
                    />
                </View>
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default RuleSelectionBase;
