import React from 'react';
import useLocalize from '@hooks/useLocalize';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import HeaderWithBackButton from './HeaderWithBackButton';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';

type ParticipantPickerProps = {
    /** Selected participants */
    participants?: Participant[] | typeof CONST.EMPTY_ARRAY;

    /** The type of IOU report */
    iouType: IOUType;

    /** The IOU action */
    action: IOUAction;

    /** Whether this is a per diem expense request */
    isPerDiemRequest?: boolean;

    /** Whether this is a time expense request */
    isTimeRequest?: boolean;

    /** Callback fired when participants are updated */
    onParticipantsAdded: (value: Participant[]) => void;

    /** Callback fired when participant selection is completed */
    onFinish?: (value?: string, participants?: Participant[]) => void;

    /** Whether the picker modal is visible */
    isVisible?: boolean;

    /** Callback fired when picker should close */
    onClose?: () => void;
};

function ParticipantPicker({
    participants = CONST.EMPTY_ARRAY,
    iouType,
    action,
    isPerDiemRequest = false,
    isTimeRequest = false,
    onParticipantsAdded,
    onFinish,
    isVisible = true,
    onClose,
}: ParticipantPickerProps) {
    const {translate} = useLocalize();

    const pickerContent = (
        <MoneyRequestParticipantsSelector
            participants={participants}
            onParticipantsAdded={onParticipantsAdded}
            onFinish={onFinish}
            iouType={iouType}
            action={action}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
        />
    );

    if (!onClose) {
        return pickerContent;
    }

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
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
        </Modal>
    );
}

export default ParticipantPicker;
