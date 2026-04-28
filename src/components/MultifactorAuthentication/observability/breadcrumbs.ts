import type {SeverityLevel} from '@sentry/react-native';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

type BreadcrumbData = Record<string, string | number | boolean | undefined>;

function addMFABreadcrumb(message: string, data?: BreadcrumbData, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `[MFA] ${message}`,
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_MFA,
        level,
        data,
    });
}

export default addMFABreadcrumb;
export type {BreadcrumbData};
