import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import type {ReportSettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {RoomVisibility} from '@src/types/onyx/Report';

type VisibilityProps = WithReportOrNotFoundProps & StackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.VISIBILITY>;

function VisibilityPage({report}: VisibilityProps) {
    const route = useRoute<RouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.VISIBILITY>>();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const shouldGoBackToDetailsPage = useRef(false);

    const shouldDisableVisibility = ReportUtils.isArchivedRoom(report, reportNameValuePairs);
    const {translate} = useLocalize();

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
        ReportUtils.goBackToDetailsPage(report, route.params.backTo);
    }, [report, route.params.backTo]);

    const changeVisibility = useCallback(
        (newVisibility: RoomVisibility) => {
            if (!report) {
                return;
            }
            ReportActions.updateRoomVisibility(report.reportID, report.visibility, newVisibility);
            if (showConfirmModal) {
                shouldGoBackToDetailsPage.current = true;
            } else {
                goBack();
            }
        },
        [report, showConfirmModal, goBack],
    );

    const hideModal = useCallback(() => {
        setShowConfirmModal(false);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={VisibilityPage.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableVisibility}>
                <HeaderWithBackButton
                    title={translate('newRoomPage.visibility')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    shouldPreventDefaultFocusOnSelectRow
                    sections={[{data: visibilityOptions}]}
                    onSelectRow={(option) => {
                        if (option.value === CONST.REPORT.VISIBILITY.PUBLIC) {
                            setShowConfirmModal(true);
                            return;
                        }
                        changeVisibility(option.value);
                    }}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={visibilityOptions.find((visibility) => visibility.isSelected)?.keyForList}
                    ListItem={RadioListItem}
                />
                <ConfirmModal
                    isVisible={showConfirmModal}
                    onConfirm={() => {
                        changeVisibility(CONST.REPORT.VISIBILITY.PUBLIC);
                        hideModal();
                    }}
                    onModalHide={() => {
                        if (!shouldGoBackToDetailsPage.current) {
                            return;
                        }
                        shouldGoBackToDetailsPage.current = false;
                        goBack();
                    }}
                    onCancel={hideModal}
                    title={translate('common.areYouSure')}
                    prompt={translate('newRoomPage.publicDescription')}
                    confirmText={translate('common.yes')}
                    cancelText={translate('common.no')}
                    danger
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

VisibilityPage.displayName = 'VisibilityPage';

export default withReportOrNotFound()(VisibilityPage);
