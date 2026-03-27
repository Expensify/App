import React, {useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import {updateRoomVisibility} from '@userActions/Report';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {RoomVisibility} from '@src/types/onyx/Report';

type DynamicVisibilityProps = WithReportOrNotFoundProps;

function DynamicVisibilityPage({report}: DynamicVisibilityProps) {
    const isReportArchived = useReportIsArchived(report?.reportID);
    const shouldDisableVisibility = isArchivedNonExpenseReport(report, isReportArchived);
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_SETTINGS_VISIBILITY.path);

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

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const changeVisibility = (newVisibility: RoomVisibility) => {
        if (!report) {
            return;
        }
        updateRoomVisibility(report.reportID, report.visibility, newVisibility);
        setNavigationActionToMicrotaskQueue(goBack);
    };

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
                    ListItem={SingleSelectListItem}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicVisibilityPage);
