import React, {useState} from 'react';
import ConfirmModal from './ConfirmModal';
import CONST from '../CONST';
import * as User from '../libs/actions/User';
import useLocalize from '@hooks/useLocalize';

const FocusModeUpgradeModal = () => {
    const {translate} = useLocalize();
    const [response, setResponse] = useState(null);
    return (
        <>
            {response === null && (
                <ConfirmModal
                    title={translate('focusModeUpgradeModal.title')}
                    onConfirm={() => {
                        User.updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, false);
                        setResponse(true);
                    }}
                    onCancel={() => {
                        setResponse(false);
                    }}
                    prompt={translate('focusModeUpgradeModal.prompt')}
                    confirmText={translate('focusModeUpgradeModal.enable')}
                    cancelText={translate('focusModeUpgradeModal.noEnable')}
                    isVisible
                />
            )}
            {(response !== null) && (
                <ConfirmModal
                    title={translate('focusModeUpgradeModal.title')}
                    prompt={response ? translate('focusModeUpgradeModal.enabled') : translate('focusModeUpgradeModal.notEnabled')}
                    confirmText={response ? translate('focusModeUpgradeModal.ok') : translate('focusModeUpgradeModal.gotItThanks')}
                    onConfirm={User.clearOfferFocusModeUpgrade}
                    onCancel={User.clearOfferFocusModeUpgrade}
                    shouldShowCancelButton={false}
                    isVisible
                />
            )}
        </>
    )
}

FocusModeUpgradeModal.displayName = 'FocusModeUpgradeModal';
export default FocusModeUpgradeModal;
