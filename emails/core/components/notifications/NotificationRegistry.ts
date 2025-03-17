import ExpenseSubmitted from './ExpenseSubmitted';
import SampleEmail from './SampleEmail';

/**
 * This is a global registry of all notifications we can render.
 */
const NotificationRegistry = {
    ExpenseSubmitted,
    SampleEmail,
} as const;

export default NotificationRegistry;
