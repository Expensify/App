import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import {TransactionViolation} from '@src/types/onyx';
import Text from './Text';

export default function FieldViolationMessages({violations}: {violations: TransactionViolation[]}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {violations.map(({name}) => (
                <View key={`violationMessages.${name}`}>
                    <Text style={[styles.ph5, styles.textLabelError]}>{translate(`violations.${name}`)}</Text>
                </View>
            ))}
        </>
    );
}
