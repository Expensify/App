import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type CONST from '@src/CONST';
import FilterComponents from '..';

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

function TextInputFilterContent({filterKey, value: initialValue, autoFocus, largeButton, style, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <FilterComponents
                value={value}
                policyID={undefined}
                filterKey={filterKey}
                autoFocus={autoFocus}
                onChange={(v) => setValue(typeof v === 'string' ? v : undefined)}
            />
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large={largeButton}
                text={translate('common.confirm')}
                pressOnEnter
                onPress={() => onChange(value)}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
