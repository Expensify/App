import type {AvatarWithDisplayNameProps} from '@components/AvatarWithDisplayName';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useThemeStyles from '@hooks/useThemeStyles';

function HeaderAvatarWithDisplayName(props: AvatarWithDisplayNameProps) {
    useDialogLabelRegistration(props.report?.reportName ?? '');
    const styles = useThemeStyles();

    return (
        <AvatarWithDisplayName
            {...props}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            style={[...props.style, styles.pr2]}
        />
    );
}

export default HeaderAvatarWithDisplayName;
