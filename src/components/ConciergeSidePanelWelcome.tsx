import React from 'react';
import {View} from 'react-native';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import Text from './Text';

function ConciergeSidePanelWelcome() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {ConciergeAvatar} = useDefaultAvatars();

    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5]}>
            <Avatar
                source={ConciergeAvatar}
                size={CONST.AVATAR_SIZE.LARGE}
                type={CONST.ICON_TYPE_AVATAR}
            />
            <Text style={[styles.textHeadlineH1, styles.mt3, styles.textAlignCenter]}>{translate('common.concierge.sidePanelGreeting')}</Text>
        </View>
    );
}

ConciergeSidePanelWelcome.displayName = 'ConciergeSidePanelWelcome';

export default ConciergeSidePanelWelcome;
