import type {AvatarWithDisplayNameProps} from '@components/AvatarWithDisplayName';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useHeaderAvatarSize from '@hooks/useHeaderAvatarSize';
import useThemeStyles from '@hooks/useThemeStyles';

import {View} from 'react-native';

function HeaderAvatarWithDisplayName(props: AvatarWithDisplayNameProps) {
    useDialogLabelRegistration(props.report?.reportName ?? '');
    const avatarSize = useHeaderAvatarSize();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.flexRow, styles.pr3]}>
            <AvatarWithDisplayName
                size={avatarSize}
                {...props}
            />
        </View>
    );
}

export default HeaderAvatarWithDisplayName;
