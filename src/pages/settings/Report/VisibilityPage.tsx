import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import type {ReportSettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type {RoomVisibility} from '@src/types/onyx/Report';

type VisibilityOnyxProps = {
    report: OnyxEntry<Report>;
};

type VisibilityProps = VisibilityOnyxProps & StackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.VISIBILITY>;

function VisibilityPage({report}: VisibilityProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const shouldDisableVisibility = ReportUtils.isArchivedRoom(report);
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

    const changeVisibility = useCallback(
        (newVisibility: RoomVisibility) => {
            if (!report) {
                return;
            }
            ReportActions.updateRoomVisibility(report.reportID, report.visibility, newVisibility, true, report);
        },
        [report],
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
                    onBackButtonPress={() => ReportUtils.goBackToDetailsPage(report)}
                />
                <SelectionList
                    sections={[{data: visibilityOptions}]}
                    onSelectRow={(option) => {
                        if (option.value === CONST.REPORT.VISIBILITY.PUBLIC) {
                            setShowConfirmModal(true);
                            return;
                        }
                        changeVisibility(option.value);
                    }}
                    initiallyFocusedOptionKey={visibilityOptions.find((visibility) => visibility.isSelected)?.keyForList}
                />
                <ConfirmModal
                    isVisible={showConfirmModal}
                    onConfirm={() => {
                        changeVisibility(CONST.REPORT.VISIBILITY.PUBLIC);
                        hideModal();
                    }}
                    onCancel={hideModal}
                    title={translate('common.areYouSure')}
                    prompt={translate('report.visibilityPublicPrompt')}
                    confirmText={translate('common.yes')}
                    cancelText={translate('common.no')}
                    danger
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

VisibilityPage.displayName = 'VisibilityPage';

export default withOnyx<VisibilityProps, VisibilityOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? ''}`,
    },
})(VisibilityPage);
