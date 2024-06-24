import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import UserListItem from '@components/SelectionList/UserListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportDetailsExportPageProps = StackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.EXPORT>;

function ReportDetailsExportPage({route}: ReportDetailsExportPageProps) {
    const reportID = route.params.reportID;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policyID = report?.policyID;
    const {translate} = useLocalize();
    const [shouldShowModal, setShouldShowModal] = useState(false);
    const integrationName = route?.params?.integrationName;
    const iconToDisplay = ReportUtils.getIntegrationIcon(integrationName);
    const canBeExported = ReportUtils.canBeExported(report);
    const integrationText = ReportUtils.getIntegrationDisplayName(integrationName);

    const exportSelectorOptions: SelectorType[] = [
        {
            value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
            text: integrationText,
            icons: [
                {
                    source: iconToDisplay,
                    type: 'avatar',
                },
            ],
            isDisabled: !canBeExported,
            onPress: () => {
                if (ReportUtils.isExported(report)) {
                    setShouldShowModal(true);
                } else {
                    Report.exportToIntegration(reportID, integrationName);
                }
            },
        },
        {
            value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
            text: translate('workspace.common.markAsExported'),
            icons: [
                {
                    source: iconToDisplay,
                    type: 'avatar',
                },
            ],
            isDisabled: !canBeExported,
            onPress: () => {
                if (ReportUtils.isExported(report)) {
                    setShouldShowModal(true);
                } else {
                    Report.markAsManuallyExported(reportID);
                }
            },
        },
    ];

    return (
        <>
            <SelectionScreen
                policyID={policyID ?? ''}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                displayName={ReportDetailsExportPage.displayName}
                sections={[{data: exportSelectorOptions}]}
                listItem={UserListItem}
                shouldBeBlocked={false}
                onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID))}
                title="common.export"
                connectionName={integrationName}
                onSelectRow={(option) => {
                    option.onPress?.();
                }}
            />
            {shouldShowModal && (
                <ConfirmModal
                    title={translate('workspace.exportAgainModal.title')}
                    onConfirm={() => setShouldShowModal(false)}
                    onCancel={() => setShouldShowModal(false)}
                    prompt={translate('workspace.exportAgainModal.description', {reportName: report?.reportName ?? '', integrationName})}
                    confirmText={translate('workspace.exportAgainModal.confirmText')}
                    cancelText={translate('workspace.exportAgainModal.cancelText')}
                    isVisible
                />
            )}
        </>
    );
}

ReportDetailsExportPage.displayName = 'ReportDetailsExportPage';

export default ReportDetailsExportPage;
