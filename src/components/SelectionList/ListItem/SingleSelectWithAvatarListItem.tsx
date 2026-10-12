import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, SingleSelectListItemProps} from './types';

import SingleSelectListItem from './SingleSelectListItem';

/**
 * A SingleSelectListItem that prepends an avatar when icons are provided. Used in pickers
 * where options have a visual identity (e.g. domain admin selection).
 */
function SingleSelectWithAvatarListItem<TItem extends ListItem>({item, wrapperStyle, ...props}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    if (!icon) {
        return (
            <SingleSelectListItem
                {...props}
                item={item}
                wrapperStyle={wrapperStyle}
            />
        );
    }

    const avatarElement = (
        <View>
            <AvatarFromIcon
                icon={icon}
                size={CONST.AVATAR_SIZE.DEFAULT}
                iconAdditionalStyles={styles.mr3}
            />
        </View>
    );

    return (
        <SingleSelectListItem
            {...props}
            item={{...item, leftElement: avatarElement}}
            wrapperStyle={[styles.optionRow, styles.pv3, styles.w100, wrapperStyle]}
        />
    );
}

export default SingleSelectWithAvatarListItem;
