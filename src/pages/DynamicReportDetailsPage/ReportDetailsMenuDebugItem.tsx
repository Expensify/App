import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

type ReportDetailsMenuDebugItemProps = {
    reportID: string;
};

function ReportDetailsMenuDebugItem({reportID}: ReportDetailsMenuDebugItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bug']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    if (!report?.reportID || !isDebugModeEnabled) {
        return null;
    }

    return (
        <MenuItem.Root
            onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(report.reportID))}
            accessibilityLabel={translate('debug.debug')}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <MenuItem.Icon src={expensifyIcons.Bug} />
                </MenuItem.Leading>
                <MenuItem.Content>
                    <MenuItem.Title>{translate('debug.debug')}</MenuItem.Title>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default ReportDetailsMenuDebugItem;
