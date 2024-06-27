import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import * as ReportUtils from '@libs/ReportUtils';
import type {ModalStatus} from '@pages/home/report/ReportDetailsExportPage';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type ExportWithDropdownMenuProps = {
    report: OnyxEntry<Report>;

    integrationName: ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;
};

function ExportWithDropdownMenu({report, integrationName}: ExportWithDropdownMenuProps) {
    const reportID = report?.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [modalStatus, setModalStatus] = useState<ModalStatus>(null);

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

    const confirmExport = useCallback(() => {
        setModalStatus(null);
        if (!reportID) {
            return;
        }
        if (modalStatus === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            ReportActions.exportToIntegration(reportID, integrationName);
        } else if (modalStatus === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            ReportActions.markAsManuallyExported(reportID);
        }
    }, [integrationName, modalStatus, reportID]);

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
                onPress={(_, value) => {
                    if (ReportUtils.isExported(report)) {
                        setModalStatus(value);
                        return;
                    }
                    if (!reportID) {
                        return;
                    }
                    if (value === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                        ReportActions.exportToIntegration(reportID, integrationName);
                    } else if (value === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                        ReportActions.markAsManuallyExported(reportID);
                    }
                }}
                onOptionSelected={() => {}}
                options={dropdownOptions}
                customText={translate('workspace.common.exportIntegrationSelected', {integrationName})}
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            />
            {!!modalStatus && (
                <ConfirmModal
                    title={translate('workspace.exportAgainModal.title')}
                    onConfirm={confirmExport}
                    onCancel={() => setModalStatus(null)}
                    prompt={translate('workspace.exportAgainModal.description', {reportName: report?.reportName ?? '', integrationName})}
                    confirmText={translate('workspace.exportAgainModal.confirmText')}
                    cancelText={translate('workspace.exportAgainModal.cancelText')}
                    isVisible
                />
            )}
        </>
    );
}

export default ExportWithDropdownMenu;
