import type {SeverityLevel} from '@sentry/react-native';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

function addMfaBreadcrumb(message: string, data?: Record<string, string | number | boolean | undefined>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `[MFA] ${message}`,
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_MFA,
        level,
        data,
    });
}

export default addMfaBreadcrumb;
