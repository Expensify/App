import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/UserListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import * as ReportActions from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
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
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const policyID = report?.policyID;

    const {translate} = useLocalize();
    const [modalStatus, setModalStatus] = useState<ExportType | null>(null);

    const iconToDisplay = ReportUtils.getIntegrationIcon(connectionName);
    const canBeExported = ReportUtils.canBeExported(report);
    const isExported = ReportUtils.isExported(reportActions);

    const confirmExport = useCallback(
        (type = modalStatus) => {
            if (type === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                ReportActions.exportToIntegration(reportID, connectionName);
            } else if (type === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                ReportActions.markAsManuallyExported(reportID, connectionName);
            }
            setModalStatus(null);
            Navigation.dismissModal();
        },
        [connectionName, modalStatus, reportID],
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
        },
        {
            value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
            text: translate('workspace.common.markAsExported'),
            icons: [
                {
                    source: iconToDisplay ?? '',
                    type: CONST.ICON_TYPE_AVATAR,
                },
            ],
            isDisabled: !canBeExported,
        },
    ];

    if (!canBeExported) {
        return (
            <ScreenWrapper testID={ReportDetailsExportPage.displayName}>
                <HeaderWithBackButton
                    title={translate('common.export')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo))}
                />
                <ConfirmationPage
                    illustration={Illustrations.LaptopwithSecondScreenandHourglass}
                    heading={translate('workspace.export.notReadyHeading')}
                    description={translate('workspace.export.notReadyDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={Navigation.goBack}
                    illustrationStyle={{width: 233, height: 162}}
                />
            </ScreenWrapper>
        );
    }

    return (
        <>
            <SelectionScreen<ExportType>
                policyID={policyID ?? ''}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                displayName={ReportDetailsExportPage.displayName}
                sections={[{data: exportSelectorOptions}]}
                listItem={UserListItem}
                shouldBeBlocked={false}
                onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo))}
                title="common.export"
                connectionName={connectionName}
                onSelectRow={({value}) => {
                    if (isExported) {
                        setModalStatus(value);
                    } else {
                        confirmExport(value);
                    }
                }}
            />
            <ConfirmModal
                title={translate('workspace.exportAgainModal.title')}
                onConfirm={confirmExport}
                onCancel={() => setModalStatus(null)}
                prompt={translate('workspace.exportAgainModal.description', {reportName: report?.reportName ?? '', connectionName})}
                confirmText={translate('workspace.exportAgainModal.confirmText')}
                cancelText={translate('workspace.exportAgainModal.cancelText')}
                isVisible={!!modalStatus}
            />
        </>
    );
}

ReportDetailsExportPage.displayName = 'ReportDetailsExportPage';

export default ReportDetailsExportPage;
export type {ExportType};
