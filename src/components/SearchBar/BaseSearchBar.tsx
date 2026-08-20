import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type SharedSearchBarProps = {
    /** Label describing the search input. Also used as the accessibility label. */
    label: string;
    inputValue: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: (text: string) => void;
    style?: StyleProp<ViewStyle>;
    shouldShowEmptyState?: boolean;
    emptyStateContainerStyle?: StyleProp<ViewStyle>;
    ref?: React.Ref<BaseTextInputRef>;
};

type BaseSearchBarProps = SharedSearchBarProps & {
    /** Variant-specific TextInput props (floating label vs placeholder, icon, size styles). */
    textInputProps?: BaseTextInputProps;
};

function BaseSearchBar({ref, label, style, inputValue, onChangeText, onSubmitEditing, shouldShowEmptyState, emptyStateContainerStyle, textInputProps}: BaseSearchBarProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const {translate} = useLocalize();
    const noResultsMessage = translate('common.noResultsFoundMatching', inputValue);
    const shouldAnnounceNoResults = !!shouldShowEmptyState && inputValue.length !== 0;

    useDebouncedAccessibilityAnnouncement(noResultsMessage, shouldAnnounceNoResults, inputValue);

    return (
        <>
            <View style={[styles.searchBarMargin, styles.searchBarWidth(shouldUseNarrowLayout && !isInLandscapeMode), style]}>
                <TextInput
                    ref={ref}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={inputValue}
                    onChangeText={onChangeText}
                    inputMode={CONST.INPUT_MODE.TEXT}
                    selectTextOnFocus
                    spellCheck={false}
                    onSubmitEditing={() => onSubmitEditing?.(inputValue)}
                    shouldShowClearButton
                    shouldHideClearButton={!inputValue?.length}
                    {...textInputProps}
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

export default BaseSearchBar;
export type {SharedSearchBarProps};
