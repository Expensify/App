import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import {TransactionViolation} from '@src/types/onyx';
import Text from './Text';

export default function FieldViolationMessages({violations}: {violations: TransactionViolation[]}) {
    const {translate} = useLocalize();
    return (
        <>
            {violations.map(({name}) => (
                <View key={`${field}.${name}`}>
                    <Text style={[styles.ph5, styles.textLabelError]}>{translate(name)}</Text>
                </View>
            ))}
        </>
    );
}
