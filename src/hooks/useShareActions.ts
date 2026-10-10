/**
 * Builds the Share option of the report More menu and the options under it.
 */
import type {SecondaryActionEntry} from '@components/MoneyReportHeaderActions/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import Clipboard from '@libs/Clipboard';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {canShareReport} from '@libs/ReportUtils';
import addTrailingForwardSlash from '@libs/UrlUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useEnvironment from './useEnvironment';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseShareActionsParams = {
    reportID: string | undefined;
    policy?: OnyxEntry<OnyxTypes.Policy>;
};

type UseShareActionsReturn = Pick<Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, SecondaryActionEntry>, typeof CONST.REPORT.SECONDARY_ACTIONS.SHARE>;

function useShareActions({reportID, policy}: UseShareActionsParams): UseShareActionsReturn {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Mail', 'QrCode', 'Cash', 'Copy', 'ArrowRight'] as const);

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    const shareSubMenuItems: PopoverMenuItem[] = [
        {
            text: translate('common.shareCode'),
            icon: expensifyIcons.QrCode,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SHARE_CODE,
            onSelected: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS_SHARE_CODE.path)),
        },
        {
            text: translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}.header`),
            icon: expensifyIcons.Cash,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REFER_FRIEND,
            onSelected: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REFERRAL_DETAILS.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND))),
        },
        {
            text: translate('qrCodes.copy'),
            icon: expensifyIcons.Copy,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.COPY_URL,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                Clipboard.setString(`${addTrailingForwardSlash(environmentURL)}${ROUTES.REPORT_WITH_ID.getRoute(moneyRequestReport.reportID)}`);
            },
        },
    ];

    if (canShareReport(moneyRequestReport, policy, currentUserAccountID)) {
        shareSubMenuItems.unshift({
            text: translate('common.shareReport'),
            icon: expensifyIcons.Mail,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SHARE_REPORT,
            onSelected: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS_SHARE_REPORT.path)),
        });
    }

    return {
        [CONST.REPORT.SECONDARY_ACTIONS.SHARE]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SHARE,
            text: translate('common.share'),
            backButtonText: translate('common.share'),
            icon: expensifyIcons.Mail,
            rightIcon: expensifyIcons.ArrowRight,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SHARE,
            subMenuItems: shareSubMenuItems,
        },
    };
}

export default useShareActions;
