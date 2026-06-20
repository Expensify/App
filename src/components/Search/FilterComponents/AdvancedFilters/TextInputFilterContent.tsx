import React, {useState} from 'react';
import {View} from 'react-native';
import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

type TextInputFilterContentProps = {
    filterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    value: string | undefined;
    largeButton?: boolean;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange: (value: string | undefined) => void;
};

function isTextInput(el: BaseTextInputRef | RNTextInput | null): el is RNTextInput {
    return !!el && 'isFocused' in el;
}

function TextInputFilterContent({filterKey, value: initialValue, autoFocus, largeButton, style, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);

    const label = translate(FILTER_VIEW_MAP[filterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(filterKey, value);

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
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
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large={largeButton}
                text={translate('common.confirm')}
                pressOnEnter
                onPress={() => {
                    if (error) {
                        return;
                    }
                    onChange(value);
                }}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
