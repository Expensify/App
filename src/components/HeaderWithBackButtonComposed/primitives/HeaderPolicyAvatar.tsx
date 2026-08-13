import Avatar from '@components/Avatar';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import React from 'react';

type HeaderPolicyAvatarProps = {
    /** Policy avatar to display in the header. */
    policyAvatar: IconType;
};

function HeaderPolicyAvatar({policyAvatar}: HeaderPolicyAvatarProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <Avatar
            containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
            source={policyAvatar?.source}
            name={policyAvatar?.name}
            avatarID={policyAvatar?.id}
            type={policyAvatar?.type}
        />
    );
}

export default HeaderPolicyAvatar;
