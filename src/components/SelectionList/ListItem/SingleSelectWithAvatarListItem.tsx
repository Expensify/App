import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import RadioListItem from './RadioListItem';
import type {ListItem, RadioListItemProps} from './types';

/**
 * A RadioListItem that prepends an avatar when icons are provided. Used in pickers
 * where options have a visual identity (e.g. domain admin selection).
 */
function SingleSelectWithAvatarListItem<TItem extends ListItem>({item, wrapperStyle, ...props}: RadioListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    if (!icon) {
        return (
            <RadioListItem
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
        <RadioListItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            item={{...item, leftElement: avatarElement}}
            wrapperStyle={[styles.optionRow, styles.pv0, styles.pv3, styles.w100, wrapperStyle]}
        />
    );
}

export default SingleSelectWithAvatarListItem;
