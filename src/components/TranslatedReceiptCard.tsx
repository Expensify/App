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

type TranslatedReceiptRowContentProps = {
    /** Line to draw */
    row: TranslatedReceiptRow;

    /** Whether the row is the first line of the receipt */
    isFirstRow: boolean;
};

function TranslatedReceiptRowContent({row, isFirstRow}: TranslatedReceiptRowContentProps) {
    const styles = useThemeStyles();

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.DIVIDER) {
        return <View style={[styles.sectionDividerLine, styles.mv4]} />;
    }

    // Rows have no heading type, so the first text row is shown as the store name because receipts almost always print it first
    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT && isFirstRow) {
        return (
            <Text
                variant="pageHeader"
                style={[styles.mb1, row.align === CONST.RECEIPT.TRANSLATION_ROW_ALIGN.CENTER && styles.textAlignCenter]}
            >
                {row.text}
            </Text>
        );
    }

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT) {
        return (
            <Text
                variant="label"
                style={[styles.textSupporting, row.align === CONST.RECEIPT.TRANSLATION_ROW_ALIGN.CENTER && styles.textAlignCenter]}
            >
                {row.text}
            </Text>
        );
    }

    const isTotal = row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TOTAL;
    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3, styles.pv1]}>
            <View style={styles.flexShrink1}>
                <Text variant={isTotal ? 'textStrong' : 'text'}>{row.text}</Text>
                {!!row.subtext && (
                    <Text
                        variant="label"
                        style={[styles.textSupporting, styles.mt1]}
                    >
                        {row.subtext}
                    </Text>
                )}
            </View>
            <Text
                variant={isTotal ? 'textStrong' : 'text'}
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
        <ScrollView
            style={styles.w100}
            contentContainerStyle={[styles.alignItemsCenter, styles.ph5]}
        >
            <View style={[styles.translatedReceiptCard, styles.highlightBG, styles.p9]}>
                {rows.map((row, index) => (
                    <TranslatedReceiptRowContent
                        // The rows have no ID and never reorder, so their position is a stable key
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        row={row}
                        isFirstRow={index === 0}
                    />
                ))}
            </View>
            <Text
                variant="label"
                style={[styles.textSupporting, styles.textAlignCenter, styles.mt4]}
            >
                {translate('receipt.translationDisclaimer')}
            </Text>
        </ScrollView>
    );
}

export default TranslatedReceiptCard;
