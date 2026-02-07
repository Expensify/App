import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {savePreferredExportMethod as savePreferredExportMethodUtils} from '@libs/actions/Policy/Policy';
import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {canBeExported as canBeExportedUtils, getIntegrationIcon, isExported as isExportedUtils} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

type ExportWithDropdownMenuProps = {
    report: OnyxEntry<Report>;

    reportActions: OnyxEntry<ReportActions>;

    connectionName: ConnectionName;

    dropdownAnchorAlignment?: AnchorAlignment;

    wrapperStyle?: StyleProp<ViewStyle>;

    /** Label for Sentry tracking */
    sentryLabel?: string;
};

function ExportWithDropdownMenu({
    report,
    reportActions,
    connectionName,
    dropdownAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
    wrapperStyle,
    sentryLabel,
}: ExportWithDropdownMenuProps) {
    const reportID = report?.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const [exportMethods] = useOnyx(ONYXKEYS.LAST_EXPORT_METHOD, {canBeMissing: true});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare']);

    const iconToDisplay = getIntegrationIcon(connectionName, expensifyIcons);
    const canBeExported = canBeExportedUtils(report);
    const isExported = isExportedUtils(reportActions);
    const flattenedWrapperStyle = StyleSheet.flatten([styles.flex1, wrapperStyle]);

    const dropdownOptions: Array<DropdownOption<ReportExportType>> = useMemo(() => {
        const optionTemplate = {
            icon: iconToDisplay,
            disabled: !canBeExported,
            displayInDefaultIconColor: true,
            iconWidth: variables.iconSizeMenuItem,
            iconHeight: variables.iconSizeMenuItem,
            additionalIconStyles: styles.integrationIcon,
        };
        const options = [
            {
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                text: translate('workspace.common.exportIntegrationSelected', {connectionName}),
                ...optionTemplate,
            },
            {
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                text: translate('workspace.common.markAsEntered'),
                ...optionTemplate,
            },
        ];
        const exportMethod = report?.policyID ? exportMethods?.[report.policyID] : null;
        if (exportMethod) {
            options.sort((method) => (method.value === exportMethod ? -1 : 0));
        }
        return options;
        // We do not include exportMethods not to re-render the component when the preferred export method changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canBeExported, iconToDisplay, connectionName, report?.policyID, translate]);

    const handleExport = (exportType: ReportExportType) => {
        if (!reportID) {
            return;
        }
        if (exportType === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            exportToIntegration(reportID, connectionName);
        } else if (exportType === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            markAsManuallyExported(reportID, connectionName);
        }
    };

    const savePreferredExportMethod = (value: ReportExportType) => {
        if (!report?.policyID) {
            return;
        }
        savePreferredExportMethodUtils(report?.policyID, value);
    };

    return (
        <ButtonWithDropdownMenu<ReportExportType>
            success
            pressOnEnter
            shouldAlwaysShowDropdownMenu
            anchorAlignment={dropdownAnchorAlignment}
            onPress={(_, value) => {
                if (isExported) {
                    showConfirmModal({
                        title: translate('workspace.exportAgainModal.title'),
                        prompt: translate('workspace.exportAgainModal.description', {connectionName, reportName: report?.reportName ?? ''}),
                        confirmText: translate('workspace.exportAgainModal.confirmText'),
                        cancelText: translate('workspace.exportAgainModal.cancelText'),
                    }).then(({action}) => {
                        if (action !== ModalActions.CONFIRM) {
                            return;
                        }
                        handleExport(value);
                    });
                    return;
                }
                handleExport(value);
            }}
            onOptionSelected={({value}) => savePreferredExportMethod(value)}
            options={dropdownOptions}
            style={[shouldUseNarrowLayout && styles.flexGrow1]}
            wrapperStyle={flattenedWrapperStyle}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            sentryLabel={sentryLabel}
        />
    );
}

export default ExportWithDropdownMenu;
