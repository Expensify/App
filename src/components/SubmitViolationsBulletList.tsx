/**
 * Bulleted list for the pre-submit violations confirmation modal. Unlike the generic `BulletList`, the header and
 * items use the same normal-sized theme text as a plain `ConfirmModal` string prompt, matching the approved design.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import Text from './Text';

type SubmitViolationsBulletListItem = string;

type SubmitViolationsBulletListProps = {
    /** List of items for the list. Each item will be rendered as a separate point. */
    items: SubmitViolationsBulletListItem[];

    /** Header content. A string is wrapped in the list's themed Text; a ReactNode is rendered as-is. */
    header: string | ReactNode;
};

function SubmitViolationsBulletList({items, header}: SubmitViolationsBulletListProps) {
    const styles = useThemeStyles();

    const renderHeader = () => {
        if (typeof header === 'string') {
            return <Text style={[styles.textNormalThemeText, styles.mb3]}>{header}</Text>;
        }
        return header;
    };

    const renderBulletPoint = (item: string) => {
        return (
            <Text
                style={[styles.textNormalThemeText, styles.mb1]}
                key={item}
            >
                {'•  '}
                {item}
            </Text>
        );
    };

    return (
        <View style={styles.w100}>
            {renderHeader()}
            <View>{items.map((item) => renderBulletPoint(item))}</View>
        </View>
    );
}

export default SubmitViolationsBulletList;
