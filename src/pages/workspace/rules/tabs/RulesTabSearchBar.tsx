import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

type RulesTabSearchBarProps = {
    /** Current search text */
    value: string;

    /** Called when the search text changes */
    onChangeText: (text: string) => void;

    /** Action button(s) rendered on the right of the bar */
    children?: ReactNode;
};

/** Filter bar for the non-table rules tabs, matching the look of the table tabs' filter bar. */
function RulesTabSearchBar({value, onChangeText, children}: RulesTabSearchBarProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [inputFocused, setInputFocused] = useState(false);

    return (
        <View style={[styles.w100, styles.gap3, styles.pb3, styles.ph5]}>
            <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.gap2, styles.alignItemsCenter]}>
                    <TextInput
                        hideFocusedState
                        multiline={false}
                        spellCheck={false}
                        autoCorrect={false}
                        placeholder={translate('workspace.rules.findRule')}
                        value={value}
                        role={CONST.ROLE.SEARCHBOX}
                        inputMode={CONST.INPUT_MODE.TEXT}
                        placeholderTextColor={theme.textSupporting}
                        inputStyle={styles.textLabel}
                        containerStyles={shouldUseNarrowLayout ? styles.flex1 : undefined}
                        textInputContainerStyles={[styles.border, styles.borderRadiusComponentNormal, styles.appBG, styles.p2, inputFocused && styles.borderColorFocus]}
                        touchableInputWrapperStyle={[!shouldUseNarrowLayout && styles.mnw200, shouldUseNarrowLayout ? styles.h11 : styles.h8]}
                        accessibilityLabel={translate('workspace.rules.findRule')}
                        shouldHideClearButton={false}
                        clearButtonStyle={shouldUseNarrowLayout ? undefined : styles.mr0}
                        clearButtonIconSize={shouldUseNarrowLayout ? undefined : variables.iconSizeSmall}
                        onBlur={() => setInputFocused(false)}
                        onFocus={() => setInputFocused(true)}
                        onChangeText={onChangeText}
                    />
                </View>
                {!!children && <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter, styles.flexShrink0]}>{children}</View>}
            </View>
        </View>
    );
}

export default RulesTabSearchBar;
