import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslatedReceiptRow} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import ScrollView from './ScrollView';
import Text from './Text';

type TranslatedReceiptCardProps = {
    /** Every line of the translated receipt, in the order it is printed */
    rows: TranslatedReceiptRow[];
};

function TranslatedReceiptRowContent({row}: {row: TranslatedReceiptRow}) {
    const styles = useThemeStyles();

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.DIVIDER) {
        return <View style={[styles.sectionDividerLine, styles.mv3]} />;
    }

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT) {
        return (
            <Text
                variant="label"
                style={row.align === CONST.RECEIPT.TRANSLATION_ROW_ALIGN.CENTER && styles.textAlignCenter}
            >
                {row.text}
            </Text>
        );
    }

    const isTotal = row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TOTAL;
    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
            <View style={styles.flexShrink1}>
                <Text variant={isTotal ? 'labelStrong' : 'label'}>{row.text}</Text>
                {!!row.subtext && (
                    <Text
                        variant="micro"
                        style={styles.textSupporting}
                    >
                        {row.subtext}
                    </Text>
                )}
            </View>
            <Text
                variant={isTotal ? 'labelStrong' : 'label'}
                style={[styles.flexShrink0, styles.textAlignRight]}
            >
                {row.value}
            </Text>
        </View>
    );
}

function TranslatedReceiptCard({rows}: TranslatedReceiptCardProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScrollView contentContainerStyle={[styles.alignItemsCenter, styles.ph5]}>
            <View style={[styles.translatedReceiptCard, styles.highlightBG, styles.p8, styles.gap3]}>
                {rows.map((row, index) => (
                    <TranslatedReceiptRowContent
                        // The rows have no ID and never reorder, so their position is a stable key
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        row={row}
                    />
                ))}
            </View>
            <Text
                variant="micro"
                style={[styles.textSupporting, styles.textAlignCenter, styles.mt3]}
            >
                {translate('receipt.translationDisclaimer')}
            </Text>
        </ScrollView>
    );
}

export default TranslatedReceiptCard;
