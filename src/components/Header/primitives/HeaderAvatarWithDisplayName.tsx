import type {AvatarWithDisplayNameProps} from '@components/AvatarWithDisplayName';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';

function HeaderAvatarWithDisplayName(props: AvatarWithDisplayNameProps) {
    useDialogLabelRegistration(props.report?.reportName ?? '');

    return <AvatarWithDisplayName {...props} />;
}

export default HeaderAvatarWithDisplayName;
