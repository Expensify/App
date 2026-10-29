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

    /** Whether to show the row as the store name */
    isHeading: boolean;

    /** Whether to leave space between this row and the one above it */
    hasTopGap: boolean;
};

function TranslatedReceiptRowContent({row, isHeading, hasTopGap}: TranslatedReceiptRowContentProps) {
    const styles = useThemeStyles();

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.DIVIDER) {
        return <View style={[styles.sectionDividerLine, styles.mv5]} />;
    }

    if (row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT) {
        return (
            <Text
                variant={isHeading ? 'pageHeader' : 'label'}
                style={[!isHeading && styles.textSupporting, hasTopGap && styles.mt2, row.align === CONST.RECEIPT.TRANSLATION_ROW_ALIGN.CENTER && styles.textAlignCenter]}
            >
                {row.text}
            </Text>
        );
    }

    const isTotal = row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TOTAL;
    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3, hasTopGap && styles.mt2]}>
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
            <View style={[styles.translatedReceiptCard, styles.highlightBG, styles.p10]}>
                {rows.map((row, index) => {
                    const previousRow = index > 0 ? rows.at(index - 1) : undefined;

                    // Rows have no heading type, so the first text row is shown as the store name because receipts almost always print it first
                    const isHeading = index === 0 && row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT;

                    // Text rows that follow each other read as one block, like the address lines under the store name
                    const isTextBlockLine = row.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT && previousRow?.type === CONST.RECEIPT.TRANSLATION_ROW_TYPE.TEXT && index > 1;

                    return (
                        <TranslatedReceiptRowContent
                            // The rows have no ID and never reorder, so their position is a stable key
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            row={row}
                            isHeading={isHeading}
                            hasTopGap={!!previousRow && previousRow.type !== CONST.RECEIPT.TRANSLATION_ROW_TYPE.DIVIDER && !isTextBlockLine}
                        />
                    );
                })}
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
