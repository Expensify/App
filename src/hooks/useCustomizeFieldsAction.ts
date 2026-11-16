/** Shares the expense field picker action between the report and transaction headers. */
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import deferNavigate from '@libs/Navigation/deferNavigate';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';

function useCustomizeFieldsAction(reportID: string | undefined): DropdownOption<typeof CONST.REPORT.SECONDARY_ACTIONS.CUSTOMIZE_FIELDS> {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Columns']);

    return {
        value: CONST.REPORT.SECONDARY_ACTIONS.CUSTOMIZE_FIELDS,
        text: translate('iou.customizeFields'),
        icon: icons.Columns,
        sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CUSTOMIZE_FIELDS,
        onSelected: () => {
            if (!reportID) {
                return;
            }
            deferNavigate(() => Navigation.navigate(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(reportID, true)));
        },
    };
}

export default useCustomizeFieldsAction;
