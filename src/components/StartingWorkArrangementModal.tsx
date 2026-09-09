import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useState} from 'react';

import type {ModalProps} from './Modal/Global/ModalContext';

import ConfirmModalWrapper from './Modal/Global/ConfirmModalWrapper';
import {ModalActions} from './Modal/Global/ModalContext';
import Text from './Text';
import WorkArrangementSelector from './WorkArrangementSelector';

type StartingWorkArrangementModalProps = ModalProps & {
    /** Arrangement the selector starts on */
    initialIsOffice: boolean;

    /** Called with the chosen arrangement when the admin applies it */
    onApply: (isOffice: boolean) => void;
};

/**
 * Asks an admin for a starting work arrangement while they are turning on the home-and-office commuter
 * exclusion method. There is no cancel button and the backdrop does not dismiss, because the method needs a
 * work arrangement to reason about and we do not want to pick one on the admin's behalf.
 */
function StartingWorkArrangementModal({closeModal, resolveModal, initialIsOffice, onApply}: StartingWorkArrangementModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isOffice, setIsOffice] = useState(initialIsOffice);

    return (
        <ConfirmModalWrapper
            closeModal={(payload) => {
                if (payload?.action === ModalActions.CONFIRM) {
                    onApply(isOffice);
                }
                closeModal(payload);
            }}
            resolveModal={resolveModal}
            title={translate('workspace.distanceRates.commuterExclusions.workArrangement.startingPrompt.title')}
            prompt={
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('workspace.distanceRates.commuterExclusions.workArrangement.startingPrompt.prompt')}</Text>
                    <WorkArrangementSelector
                        isOffice={isOffice}
                        onSelect={setIsOffice}
                        shouldDescribeMostMembers
                    />
                </>
            }
            confirmText={translate('workspace.distanceRates.commuterExclusions.workArrangement.startingPrompt.confirm')}
            shouldShowCancelButton={false}
            onBackdropPress={() => {}}
        />
    );
}

export default StartingWorkArrangementModal;
