import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type CONST from '@src/CONST';
import FilterComponents from '..';

type TextInputFilterContentProps = {
    baseFilterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    value: string | undefined;
    isNegated: boolean;
    largeButton?: boolean;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange: (value: string | undefined, isNegated: boolean) => void;
};

function TextInputFilterContent({baseFilterKey, value: initialValue, isNegated: initialIsNegated, autoFocus, largeButton, style, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <FilterComponents
                baseFilterKey={baseFilterKey}
                value={value}
                isNegated={isNegated}
                policyIDs={undefined}
                policyIDQuery={undefined}
                autoFocus={autoFocus}
                onChange={(v) => setValue(typeof v === 'string' ? v : undefined)}
                onNegationChange={setIsNegated}
            />
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large={largeButton}
                text={translate('common.confirm')}
                pressOnEnter
                onPress={() => onChange(value, isNegated)}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
