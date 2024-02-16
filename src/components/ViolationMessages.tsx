import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import type {TransactionViolation} from '@src/types/onyx';
import Text from './Text';

type ViolationMessagesProps = {violations: TransactionViolation[]; isLast?: boolean; containerStyle?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>};

export default function ViolationMessages({violations, isLast, containerStyle, textStyle}: ViolationMessagesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const violationMessages = useMemo(() => violations.map((violation) => [violation.name, ViolationsUtils.getViolationTranslation(violation, translate)]), [translate, violations]);

    return (
        <View style={[styles.mtn2, isLast ? styles.mb2 : styles.mb1, containerStyle]}>
            {violationMessages.map(([name, message]) => (
                <Text
                    key={`violationMessages.${name}`}
                    style={[styles.ph5, styles.textLabelError, textStyle]}
                >
                    {message}
                </Text>
            ))}
        </View>
    );
}
