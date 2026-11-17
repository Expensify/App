import type {PermissionStatus} from 'react-native-permissions';

type UseContactPermissionModalParams = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: (permission: PermissionStatus) => void;

    /** A callback to call when the text input should be focused */
    onFocusTextInput: () => void;

    /** Whether the import contacts prompt may be shown. When false, the hook only asks for the text input to be focused. */
    isEnabled?: boolean;
};

export default UseContactPermissionModalParams;
