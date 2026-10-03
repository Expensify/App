import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type AvatarWithTextCellProps = {
    reportName?: string;
    icon?: Icon;
    isLargeScreenWidth?: boolean;
    textStyle?: StyleProp<TextStyle>;

    /** Whether the text can be selected inside a copyable row */
    isCopyable?: boolean;
};

function AvatarWithTextCell({reportName, icon, isLargeScreenWidth, textStyle, isCopyable = false}: AvatarWithTextCellProps) {
    const styles = useThemeStyles();

    if (!reportName || !icon) {
        return null;
    }

    const avatar = (
        <AvatarFromIcon
            icon={icon}
            size={CONST.AVATAR_SIZE.XXX_SMALL}
            containerStyles={styles.pr2}
        />
    );

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {isCopyable ? (
                <View
                    style={styles.userSelectNone}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    {avatar}
                </View>
            ) : (
                avatar
            )}

            <Text
                numberOfLines={1}
                style={[textStyle ?? (isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold), styles.flexShrink1]}
                selectable={isCopyable ? true : undefined}
                dataSet={isCopyable ? COPYABLE_TEXT_DATA_SET : undefined}
            >
                {reportName}
            </Text>
        </View>
    );
}

export default AvatarWithTextCell;
