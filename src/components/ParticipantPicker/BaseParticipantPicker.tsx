import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';

import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import CONST from '@src/CONST';

import React from 'react';

import type {ParticipantPickerProps} from './types';

function BaseParticipantPicker({
    participants = CONST.EMPTY_ARRAY,
    iouType,
    action,
    isPerDiemRequest = false,
    isTimeRequest = false,
    isWorkspacesOnly = false,
    shouldExcludeP2P = false,
    onParticipantsAdded,
    onFinish,
    onClose,
}: ParticipantPickerProps) {
    const {translate} = useLocalize();
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const selectedParticipant = isSplitRequest ? undefined : participants?.find((participant) => participant.selected && !participant.isSender);
    const selectedParticipantsWithoutReport = selectedParticipant && !selectedParticipant.reportID ? [selectedParticipant] : CONST.EMPTY_ARRAY;

    const pickerContent = (
        <MoneyRequestParticipantsSelector
            participants={isSplitRequest ? participants : selectedParticipantsWithoutReport}
            onParticipantsAdded={onParticipantsAdded}
            onFinish={onFinish}
            iouType={iouType}
            action={action}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            isWorkspacesOnly={isWorkspacesOnly}
            shouldExcludeP2P={shouldExcludeP2P}
            onRestrictedParticipantSelected={onClose}
            onCloseParticipantPicker={onClose}
            initiallySelectedReportID={selectedParticipant?.reportID}
            shouldMoveSelectedToTop
        />
    );

    if (!onClose) {
        return pickerContent;
    }

    return (
        <ScreenWrapper
            includePaddingTop={false}
            shouldEnableKeyboardAvoidingView={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="ParticipantPickerModal"
        >
            <HeaderWithBackButton
                title={translate('iou.chooseRecipient')}
                shouldShowBackButton
                onBackButtonPress={onClose}
            />
            {pickerContent}
        </ScreenWrapper>
    );
}

BaseParticipantPicker.displayName = 'BaseParticipantPicker';

export default BaseParticipantPicker;
