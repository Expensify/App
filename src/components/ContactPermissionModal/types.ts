import type {PermissionStatus} from 'react-native-permissions';

type ContactPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: (permission: PermissionStatus) => void;
};

export default {};

export type {ContactPermissionModalProps};
