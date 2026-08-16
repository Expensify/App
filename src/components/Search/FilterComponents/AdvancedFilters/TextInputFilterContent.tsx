import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import Button from '@components/ButtonComposed';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

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
    shouldFillAvailableHeight?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange: (value: string | undefined, isNegated: boolean) => void;
};

function isTextInput(element: BaseTextInputRef | RNTextInput | null): element is RNTextInput {
    return !!element && 'isFocused' in element;
}

function TextInputFilterContent({baseFilterKey, value: initialValue, isNegated: initialIsNegated, autoFocus, size, shouldFillAvailableHeight, style, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);

    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(baseFilterKey, value);

    const submit = () => {
        if (error) {
            return;
        }
        onChange(value, isNegated);
    };

    const renderTextInput = (maxAutoGrowHeight?: number) => (
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
            textInputContainerStyles={shouldFillAvailableHeight ? [styles.pt3] : undefined}
            autoGrowHeight={shouldFillAvailableHeight}
            maxAutoGrowHeight={!value && shouldFillAvailableHeight ? variables.componentSizeLarge : maxAutoGrowHeight}
            submitBehavior={shouldFillAvailableHeight ? 'submit' : undefined}
            onSubmitEditing={shouldFillAvailableHeight ? submit : undefined}
        />
    );

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <NegatableFilter
                baseFilterKey={baseFilterKey}
                isNegated={isNegated}
                style={shouldFillAvailableHeight ? styles.flex1 : undefined}
                onNegationChange={setIsNegated}
            >
                {shouldFillAvailableHeight ? <AutoGrowHeightInputContainer>{renderTextInput}</AutoGrowHeightInputContainer> : renderTextInput()}
            </NegatableFilter>
            <Button
                style={[styles.ph5, styles.pb5]}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={size}
                onPress={submit}
            >
                {!shouldFillAvailableHeight && <Button.KeyboardShortcut />}
                <Button.Text>{translate('common.confirm')}</Button.Text>
            </Button>
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
