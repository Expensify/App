import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';

type SelectionItem = {
    name: string;
    value: string;
};

type RuleSelectionBaseProps = {
    /** The translation key for the page title */
    titleKey: TranslationPaths;

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
    backToRoute: Route;

    /** Optional hash for rule not found validation */
    hash?: string;
};

function RuleSelectionBase({titleKey, testID, selectedItem, items, onSave, onBack, backToRoute, hash}: RuleSelectionBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID={testID}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(titleKey)}
                    onBackButtonPress={onBack}
                />
                <View style={[styles.flex1]}>
                    <SearchSingleSelectionPicker
                        backToRoute={backToRoute}
                        initiallySelectedItem={selectedItem}
                        items={items}
                        onSaveSelection={onSave}
                        shouldAutoSave
                    />
                </View>
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default RuleSelectionBase;
