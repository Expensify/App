import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

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
    backToRoute: string;

    /** Optional wrapper component for the content */
    ContentWrapper?: React.ComponentType<{children: React.ReactNode}>;
};

function RuleSelectionBase({titleKey, testID, selectedItem, items, onSave, onBack, backToRoute, ContentWrapper}: RuleSelectionBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const content = (
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
    );

    if (ContentWrapper) {
        return <ContentWrapper>{content}</ContentWrapper>;
    }

    return content;
}

export default RuleSelectionBase;
