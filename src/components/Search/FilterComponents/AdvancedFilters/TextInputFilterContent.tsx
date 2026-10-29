import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode} from 'react';
import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

type TextInputFilterContentProps = {
    baseFilterKey: Exclude<SearchTextFilterKeys, typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT | ReportFieldTextKey>;
    value: string | undefined;
    isNegated: boolean;
    size?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    buttonText?: string;
    buttonStyles?: StyleProp<ViewStyle>;
    sentryLabel?: string;

    /** Renders extra controls under the input, inside the scrollable area. Receives the current negation state, so the content can change when the user negates the filter. */
    renderBelowInput?: (isNegated: boolean) => ReactNode;

    onChange: (value: string | undefined, isNegated: boolean) => void;
};

function isTextInput(element: BaseTextInputRef | ComponentRef<typeof RNTextInput> | null): element is ComponentRef<typeof RNTextInput> {
    return !!element && 'isFocused' in element;
}

function TextInputFilterContent({
    baseFilterKey,
    value: initialValue,
    isNegated: initialIsNegated,
    autoFocus,
    size,
    style,
    buttonText,
    buttonStyles,
    sentryLabel,
    renderBelowInput,
    onChange,
}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);

    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(baseFilterKey, value);
    const shouldButtonBeInScrollView = useShouldFooterBeInsideList();

    const button = (
        <Button
            style={[styles.ph5, styles.pb5, buttonStyles]}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={size}
            onPress={() => {
                if (error) {
                    return;
                }
                onChange(value, isNegated);
            }}
            sentryLabel={sentryLabel}
        >
            <Button.KeyboardShortcut />
            <Button.Text>{buttonText ?? translate('common.confirm')}</Button.Text>
        </Button>
    );

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.flexGrow1, styles.gap3]}
            >
                <NegatableFilter
                    baseFilterKey={baseFilterKey}
                    isNegated={isNegated}
                    onNegationChange={setIsNegated}
                >
                    <TextInput
                        ref={(ref) => {
                            if (!autoFocus || !isTextInput(ref)) {
                                return;
                            }
                            inputCallbackRef(ref);
                        }}
                        placeholder={label}
                        value={value}
                        errorText={error}
                        hasError={!!error}
                        onChangeText={setValue}
                        accessibilityLabel={label}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.ph5]}
                    />
                </NegatableFilter>
                {renderBelowInput?.(isNegated)}
                {shouldButtonBeInScrollView && button}
            </ScrollView>
            {!shouldButtonBeInScrollView && button}
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
