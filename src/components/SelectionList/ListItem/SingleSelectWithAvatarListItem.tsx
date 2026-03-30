import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SingleSelectListItem from './SingleSelectListItem';
import type {ListItem, SingleSelectListItemProps} from './types';

/**
 * SingleSelectWithAvatarListItem extends SingleSelectListItem by adding avatar support.
 */
function SingleSelectWithAvatarListItem<TItem extends ListItem>({item, wrapperStyle, ...props}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    if (!icon) {
        return (
            <SingleSelectListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                item={item}
                wrapperStyle={wrapperStyle}
            />
        );
    }

    const avatarElement = (
        <View>
            <Avatar
                source={icon.source}
                size={CONST.AVATAR_SIZE.DEFAULT}
                name={icon.name}
                avatarID={icon.id}
                type={icon.type ?? CONST.ICON_TYPE_AVATAR}
                fallbackIcon={icon.fallbackIcon}
                iconAdditionalStyles={[{width: variables.avatarSizeNormal, height: variables.avatarSizeNormal}, styles.mr3]}
            />
        </View>
    );

    return (
        <SingleSelectListItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            item={{...item, leftElement: avatarElement}}
            wrapperStyle={[styles.optionRow, styles.pv0, styles.pv3, styles.w100, wrapperStyle]}
        />
    );
}

export default SingleSelectWithAvatarListItem;
