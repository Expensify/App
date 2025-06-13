import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {MagnifyingGlass} from './Icon/Expensicons';
import Text from './Text';
import TextInput from './TextInput';

type SearchBarProps = {
    label: string;
    icon?: IconAsset;
    inputValue: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: (text: string) => void;
    style?: StyleProp<ViewStyle>;
    shouldShowEmptyState?: boolean;
};

function SearchBar({label, style, icon = MagnifyingGlass, inputValue, onChangeText, onSubmitEditing, shouldShowEmptyState}: SearchBarProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

    return (
        <>
            <View style={[styles.getSearchBarStyle(shouldUseNarrowLayout), style]}>
                <TextInput
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={inputValue}
                    onChangeText={onChangeText}
                    inputMode={CONST.INPUT_MODE.TEXT}
                    selectTextOnFocus
                    spellCheck={false}
                    icon={inputValue?.length ? undefined : icon}
                    iconContainerStyle={styles.p0}
                    onSubmitEditing={() => onSubmitEditing?.(inputValue)}
                    shouldShowClearButton
                    shouldHideClearButton={!inputValue?.length}
                />
            </View>
            {!!shouldShowEmptyState && inputValue.length !== 0 && (
                <View style={[styles.ph5, styles.pt3, styles.pb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', {searchString: inputValue})}</Text>
                </View>
            )}
        </>
    );
}

SearchBar.displayName = 'SearchBar';
export default SearchBar;
