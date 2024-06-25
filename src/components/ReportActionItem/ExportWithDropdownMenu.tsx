import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type ExportWithDropdownMenuProps = {
    report: OnyxTypes.Report;

    policy: OnyxTypes.Policy;

    integrationName: ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;
};

function ExportWithDropdownMenu({report, integrationName}: ExportWithDropdownMenuProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useResponsiveLayout();

    const iconToDisplay = ReportUtils.getIntegrationIcon(integrationName);
    const canBeExported = ReportUtils.canBeExported(report);

    const dropdownOptions: Array<DropdownOption<ReportExportType>> = useMemo(
        () => [
            {
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                text: translate('common.export'),
                icon: iconToDisplay,
                disabled: !canBeExported,
            },
            {
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                text: translate('workspace.common.markAsExported'),
                icon: iconToDisplay,
                disabled: !canBeExported,
            },
        ],
        [canBeExported, iconToDisplay, translate],
    );

    return (
        <>
            <ButtonWithDropdownMenu
                success
                pressOnEnter
                shouldAlwaysShowDropdownMenu
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                onPress={() => {}}
                onOptionSelected={() => {
                    // do logic with API calls depending on the option, "export" or "markAsExported"
                }}
                options={dropdownOptions}
                customText={translate('workspace.common.exportIntegrationSelected', {integrationName})}
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            />
            <ConfirmModal
                onConfirm={() => {}}
                isVisible={false}
            />
        </>
    );
}

export default ExportWithDropdownMenu;
