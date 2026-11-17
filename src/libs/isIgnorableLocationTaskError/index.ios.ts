import type {TaskManagerError} from 'expo-task-manager';

// Core Location keeps trying after kCLErrorLocationUnknown (code 0), so the next update can recover.
function isIgnorableLocationTaskError(error: TaskManagerError): boolean {
    return error.code === 0;
}

export default isIgnorableLocationTaskError;
