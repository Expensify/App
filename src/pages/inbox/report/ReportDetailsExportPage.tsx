import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {canBeExported as canBeExportedUtil, getIntegrationIcon, isExported as isExportedUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportDetailsExportPageProps = PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.EXPORT>;

type ExportType = ValueOf<typeof CONST.REPORT.EXPORT_OPTIONS>;

type ExportSelectorType = SelectorType<ExportType>;

function ReportDetailsExportPage({route}: ReportDetailsExportPageProps) {
    const connectionName = route?.params?.connectionName;
    const reportID = route.params.reportID;
    const backTo = route.params.backTo;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const policyID = report?.policyID;

    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const lazyIllustrations = useMemoizedLazyIllustrations(['LaptopWithSecondScreenAndHourglass']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare']);

    const iconToDisplay = getIntegrationIcon(connectionName, expensifyIcons);
    const canBeExported = canBeExportedUtil(report);
    const isExported = isExportedUtil(reportActions);

    const confirmExport = useCallback(
        (type: ExportType) => {
            if (type === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                exportToIntegration(reportID, connectionName);
            } else if (type === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                markAsManuallyExported(reportID, connectionName);
            }
            Navigation.dismissModal();
        },
        [connectionName, reportID],
    );

    const showExportAgainModal = useCallback(
        async (type: ExportType) => {
            const result = await showConfirmModal({
                title: translate('workspace.exportAgainModal.title'),
                prompt: translate('workspace.exportAgainModal.description', {reportName: report?.reportName ?? '', connectionName}),
                confirmText: translate('workspace.exportAgainModal.confirmText'),
                cancelText: translate('workspace.exportAgainModal.cancelText'),
            });
            if (result.action === ModalActions.CONFIRM) {
                confirmExport(type);
            }
        },
        [showConfirmModal, translate, report?.reportName, connectionName, confirmExport],
    );

    const exportSelectorOptions: ExportSelectorType[] = [
        {
            value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
            text: translate('workspace.common.exportIntegrationSelected', {connectionName}),
            icons: [
                {
                    source: iconToDisplay ?? '',
                    type: CONST.ICON_TYPE_AVATAR,
                },
            ],
            isDisabled: !canBeExported,
            keyForList: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
        },
        {
            value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
            text: translate('workspace.common.markAsEntered'),
            icons: [
                {
                    source: iconToDisplay ?? '',
                    type: CONST.ICON_TYPE_AVATAR,
                },
            ],
            isDisabled: !canBeExported,
            keyForList: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
        },
    ];

    if (!canBeExported) {
        return (
            <ScreenWrapper testID="ReportDetailsExportPage">
                <HeaderWithBackButton
                    title={translate('common.export')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo))}
                />
                <ConfirmationPage
                    illustration={lazyIllustrations.LaptopWithSecondScreenAndHourglass}
                    heading={translate('workspace.export.notReadyHeading')}
                    description={translate('workspace.export.notReadyDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.goBack()}
                    illustrationStyle={{width: 233, height: 162}}
                    containerStyle={styles.flex1}
                />
            </ScreenWrapper>
        );
    }

    return (
        <SelectionScreen<ExportType>
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="ReportDetailsExportPage"
            data={exportSelectorOptions}
            listItem={UserListItem}
            shouldBeBlocked={false}
            onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo))}
            title="common.export"
            connectionName={connectionName}
            onSelectRow={({value}) => {
                if (isExported) {
                    showExportAgainModal(value);
                } else {
                    confirmExport(value);
                }
            }}
        />
    );
}

export default ReportDetailsExportPage;
export type {ExportType};
