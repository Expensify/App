import type {AvatarWithDisplayNameProps} from '@components/AvatarWithDisplayName';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useThemeStyles from '@hooks/useThemeStyles';

import {View} from 'react-native';

function HeaderAvatarWithDisplayName(props: AvatarWithDisplayNameProps) {
    useDialogLabelRegistration(props.report?.reportName ?? '');
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.pr2]}>
            <AvatarWithDisplayName {...props} />
        </View>
    );
}

export default HeaderAvatarWithDisplayName;
