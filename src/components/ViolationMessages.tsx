import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ViolationsUtils, {filterReceiptViolations} from '@libs/Violations/ViolationsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';
import Text from './Text';

type ViolationMessagesProps = {
    violations: TransactionViolation[];
    isLast?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    canEdit: boolean;
    companyCardPageURL?: string;
    connectionLink?: string;
};

export default function ViolationMessages({violations, isLast, containerStyle, textStyle, canEdit, companyCardPageURL, connectionLink}: ViolationMessagesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    const filteredViolations = useMemo(() => filterReceiptViolations(violations), [violations]);

    const violationMessages = useMemo(
        () =>
            filteredViolations.map((violation) => [
                violation.name,
                ViolationsUtils.getViolationTranslation(violation, translate, canEdit, undefined, companyCardPageURL, connectionLink, cardList),
            ]),
        [canEdit, translate, filteredViolations, companyCardPageURL, connectionLink, cardList],
    );

    return (
        <View style={[styles.mtn1, isLast ? styles.mb2 : styles.mb1, containerStyle, styles.gap1]}>
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
