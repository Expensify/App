import type {TaskManagerError} from 'expo-task-manager';

// Keep the same signature as the iOS implementation, even though other platforms never ignore errors.
// eslint-disable-next-line no-unused-vars
function isIgnorableLocationTaskError(_error: TaskManagerError): boolean {
    return false;
}

export default isIgnorableLocationTaskError;
