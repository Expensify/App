import type {AvatarWithDisplayNameProps} from '@components/AvatarWithDisplayName';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useHeaderAvatarSize from '@hooks/useHeaderAvatarSize';

function HeaderAvatarWithDisplayName(props: AvatarWithDisplayNameProps) {
    useDialogLabelRegistration(props.report?.reportName ?? '');
    const avatarSize = useHeaderAvatarSize();

    return (
        <AvatarWithDisplayName
            size={avatarSize}
            {...props}
        />
    );
}

export default HeaderAvatarWithDisplayName;
