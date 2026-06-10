import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
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
    emptyStateContainerStyle?: StyleProp<ViewStyle>;

    /** When true, renders a shorter, bordered variant (matches the Spend page header search input). */
    compact?: boolean;
};

function SearchBar({label, style, icon, inputValue, onChangeText, onSubmitEditing, shouldShowEmptyState, emptyStateContainerStyle, compact = false}: SearchBarProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const noResultsMessage = translate('common.noResultsFoundMatching', inputValue);
    const shouldAnnounceNoResults = !!shouldShowEmptyState && inputValue.length !== 0;

    useDebouncedAccessibilityAnnouncement(noResultsMessage, shouldAnnounceNoResults, inputValue);

    return (
        <>
            <View style={[!compact && styles.searchBarMargin, !compact && styles.searchBarWidth(shouldUseNarrowLayout && !isInLandscapeMode), style]}>
                <TextInput
                    label={compact ? '' : label}
                    placeholder={compact ? label : undefined}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={inputValue}
                    onChangeText={onChangeText}
                    inputMode={CONST.INPUT_MODE.TEXT}
                    selectTextOnFocus
                    spellCheck={false}
                    icon={compact || inputValue?.length ? undefined : (icon ?? expensifyIcons.MagnifyingGlass)}
                    iconContainerStyle={styles.p0}
                    onSubmitEditing={() => onSubmitEditing?.(inputValue)}
                    shouldShowClearButton
                    shouldHideClearButton={!inputValue?.length}
                    touchableInputWrapperStyle={compact ? styles.searchBarCompactWrapper : undefined}
                    inputStyle={compact ? styles.searchBarCompactInput : undefined}
                />
            </View>
            {shouldAnnounceNoResults && (
                <View style={[styles.ph5, styles.pt3, styles.pb5, emptyStateContainerStyle]}>
                    <Text
                        style={[styles.textNormal, styles.colorMuted]}
                        aria-hidden
                    >
                        {noResultsMessage}
                    </Text>
                </View>
            )}
        </>
    );
}

export default SearchBar;
