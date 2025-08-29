import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import type {SearchSingleSelectionPickerItem} from '@components/Search/SearchSingleSelectionPicker';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type SelectionOption<T> = {
    text: string;
    value: T;
};

type SearchFiltersSingleSelectBaseProps<T> = {
    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** Test ID for the screen wrapper */
    testID: string;

    /** The currently selected value */
    selectedValue: T | undefined;

    /** Array of options to display */
    options: SelectionOption<T>[];

    /** Function to call when applying changes */
    onApply: (selectedValue: T | undefined) => void;

    /** Default value to use when resetting */
    defaultValue?: T | undefined;

    /** Whether to include safe area padding bottom */
    includeSafeAreaPaddingBottom?: boolean;

    /** Whether to use SearchSingleSelectionPicker instead of SelectionList */
    useSearchPicker?: boolean;

    /** Whether to use SearchFilterPageFooterButtons instead of individual buttons */
    useFooterButtons?: boolean;

    /** Whether to show text input in SearchSingleSelectionPicker */
    shouldShowTextInput?: boolean;

    /** Custom apply logic that gets called before onApply */
    customApplyLogic?: (selectedValue: T | undefined) => Record<string, any>;
};

function SearchFiltersSingleSelectBase<T extends string | undefined>({
    titleKey,
    testID,
    selectedValue,
    options,
    onApply,
    defaultValue,
    includeSafeAreaPaddingBottom = false,
    useSearchPicker = false,
    useFooterButtons = false,
    shouldShowTextInput = true,
    customApplyLogic,
}: SearchFiltersSingleSelectBaseProps<T>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [localSelectedValue, setLocalSelectedValue] = useState<T | undefined>(selectedValue);

    const resetChanges = useCallback(() => {
        setLocalSelectedValue(defaultValue);
    }, [defaultValue]);

    const applyChanges = useCallback(() => {
        const filtersToUpdate = customApplyLogic ? customApplyLogic(localSelectedValue) : {};
        updateAdvancedFilters(filtersToUpdate);
        onApply(localSelectedValue);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [localSelectedValue, onApply, customApplyLogic]);

    const renderFooter = useCallback(() => {
        if (useFooterButtons) {
            return (
                <FixedFooter style={styles.mtAuto}>
                    <SearchFilterPageFooterButtons
                        resetChanges={resetChanges}
                        applyChanges={applyChanges}
                    />
                </FixedFooter>
            );
        }

        return (
            <FixedFooter style={styles.mtAuto}>
                <Button
                    large
                    style={[styles.mt4]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    large
                    success
                    pressOnEnter
                    style={[styles.mt4]}
                    text={translate('common.save')}
                    onPress={applyChanges}
                />
            </FixedFooter>
        );
    }, [useFooterButtons, resetChanges, applyChanges, styles, translate]);

    const renderContent = () => {
        if (useSearchPicker) {
            const pickerItems: SearchSingleSelectionPickerItem[] = options.map((option) => ({
                name: option.text,
                value: option.value as string,
            }));

            const selectedPickerItem = localSelectedValue
                ? pickerItems.find((item) => item.value === localSelectedValue)
                : undefined;

            const handleSaveSelection = (value: string | undefined) => {
                const filtersToUpdate = customApplyLogic ? customApplyLogic(value as T) : {};
                updateAdvancedFilters(filtersToUpdate);
                onApply(value as T);
            };

            return (
                <SearchSingleSelectionPicker
                    items={pickerItems}
                    initiallySelectedItem={selectedPickerItem}
                    onSaveSelection={handleSaveSelection}
                    shouldShowTextInput={shouldShowTextInput}
                />
            );
        }

        const listData: Array<ListItem<T>> = useMemo(() => {
            return options.map((option) => ({
                text: option.text,
                keyForList: option.value,
                isSelected: localSelectedValue === option.value,
            }));
        }, [options, localSelectedValue]);

        const updateSelectedItem = useCallback((item: ListItem<T>) => {
            setLocalSelectedValue(item?.keyForList ?? defaultValue);
        }, [defaultValue]);

        return (
            <>
                <View style={[styles.flex1]}>
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        sections={[{data: listData}]}
                        ListItem={SingleSelectListItem}
                        onSelectRow={updateSelectedItem}
                    />
                </View>
                {renderFooter()}
            </>
        );
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            {useSearchPicker ? (
                <View style={[styles.flex1]}>
                    {renderContent()}
                </View>
            ) : (
                renderContent()
            )}
        </ScreenWrapper>
    );
}

SearchFiltersSingleSelectBase.displayName = 'SearchFiltersSingleSelectBase';

export default SearchFiltersSingleSelectBase;
export type {SelectionOption};
