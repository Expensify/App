import Button from '@components/Button';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import NegatableFilter from '../NegatableFilter';

type TextInputFilterContentProps = {
    baseFilterKey: Exclude<SearchTextFilterKeys, typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT | ReportFieldTextKey>;
    value: string | undefined;
    isNegated: boolean;
    largeButton?: boolean;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange: (value: string | undefined, isNegated: boolean) => void;
};

function isTextInput(element: BaseTextInputRef | RNTextInput | null): element is RNTextInput {
    return !!element && 'isFocused' in element;
}

function TextInputFilterContent({baseFilterKey, value: initialValue, isNegated: initialIsNegated, autoFocus, largeButton, style, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);

    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(baseFilterKey, value);

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
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
                    onChange(value, isNegated);
                }}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
