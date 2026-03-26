import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type BulletListItem = string;

type BulletListProps = {
    /** List of items for the list. Each item will be rendered as a separate point.  */
    items: BulletListItem[];

    /** Header section of the list */
    header: string | ReactNode;
};

function BulletList({items, header}: BulletListProps) {
    const styles = useThemeStyles();

    const baseTextStyles = [styles.mutedNormalTextLabel];

    const renderBulletListHeader = () => {
        if (typeof header === 'string') {
            return <Text style={baseTextStyles}>{header}</Text>;
        }
        return header;
    };

    const renderBulletPoint = (item: string) => {
        return (
            <Text
                style={baseTextStyles}
                key={item}
            >
                <Text style={[styles.ph2, baseTextStyles]}>•</Text>
                {item}
            </Text>
        );
    };

    return (
        <View style={[styles.w100, styles.mt2]}>
            {renderBulletListHeader()}
            <View>{items.map((item) => renderBulletPoint(item))}</View>
        </View>
    );
}

export default BulletList;
