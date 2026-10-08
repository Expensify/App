import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isHiddenForCurrentUser, isMoneyRequestReport as isMoneyRequestReportUtil} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

type ReportDetailsMenuSettingsItemProps = {
    reportID: string;
};

function ReportDetailsMenuSettingsItem({reportID}: ReportDetailsMenuSettingsItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(report);
    const shouldShowWriteCapability = !isMoneyRequestReport;
    const shouldShowMenuItem = shouldShowNotificationPref || shouldShowWriteCapability || (!!report?.visibility && report.chatType !== CONST.REPORT.CHAT_TYPE.INVOICE);

    if (!shouldShowMenuItem) {
        return null;
    }

    return (
        <MenuItem
            title={translate('common.settings')}
            icon={expensifyIcons.Gear}
            onPress={() => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS.path));
            }}
            isAnonymousAction={false}
            shouldShowRightIcon
        />
    );
}

export default ReportDetailsMenuSettingsItem;
