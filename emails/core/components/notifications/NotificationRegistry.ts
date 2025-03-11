import SampleEmail from './SampleEmail';

/**
 * This is a global registry of all notifications we can render.
 */
const NotificationRegistry = {
    SampleEmail,
} as const;

export default NotificationRegistry;
