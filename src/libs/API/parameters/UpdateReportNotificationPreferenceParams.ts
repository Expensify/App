import type {NotificationPreference} from '@src/types/onyx/Report';

type UpdateReportNotificationPreferenceParams = {
    reportID: string;
    notificationPreference: NotificationPreference;
};

export default UpdateReportNotificationPreferenceParams;
