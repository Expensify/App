import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportSettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackToDetailsPage, isArchivedNonExpenseReport} from '@libs/ReportUtils';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import {updateRoomVisibility} from '@userActions/Report';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {RoomVisibility} from '@src/types/onyx/Report';

type VisibilityProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.VISIBILITY>;

function VisibilityPage({report}: VisibilityProps) {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.VISIBILITY>>();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const shouldDisableVisibility = isArchivedNonExpenseReport(report, isReportArchived);
    const {translate} = useLocalize();

    const {showConfirmModal} = useConfirmModal();

    const visibilityOptions = useMemo(
        () =>
            Object.values(CONST.REPORT.VISIBILITY)
                .filter((visibilityOption) => visibilityOption !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE)
                .map((visibilityOption) => ({
                    text: translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
                    value: visibilityOption,
                    alternateText: translate(`newRoomPage.${visibilityOption}Description`),
                    keyForList: visibilityOption,
                    isSelected: visibilityOption === report?.visibility,
                })),
        [translate, report?.visibility],
    );

    const goBack = useCallback(() => {
        goBackToDetailsPage(report, route.params.backTo);
    }, [report, route.params.backTo]);

    const changeVisibility = useCallback(
        (newVisibility: RoomVisibility) => {
            if (!report) {
                return;
            }
            updateRoomVisibility(report.reportID, report.visibility, newVisibility);
            goBack();
        },
        [report, showConfirmModal, goBack],
    );

    const showPublicVisibilityModal = async () => {
        const result = await showConfirmModal({
            title: translate('common.areYouSure'),
            prompt: translate('newRoomPage.publicDescription'),
            confirmText: translate('common.yes'),
            cancelText: translate('common.no'),
            shouldShowCancelButton: true,
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        changeVisibility(CONST.REPORT.VISIBILITY.PUBLIC);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="VisibilityPage"
        >
            <FullPageNotFoundView shouldShow={shouldDisableVisibility}>
                <HeaderWithBackButton
                    title={translate('newRoomPage.visibility')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    shouldPreventDefaultFocusOnSelectRow
                    data={visibilityOptions}
                    onSelectRow={(option) => {
                        if (option.value === CONST.REPORT.VISIBILITY.PUBLIC) {
                            showPublicVisibilityModal();
                            return;
                        }
                        changeVisibility(option.value);
                    }}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={visibilityOptions.find((visibility) => visibility.isSelected)?.keyForList}
                    ListItem={RadioListItem}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(VisibilityPage);
