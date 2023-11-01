import React, {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import Text from './Text';
import TextLinkWithRef from './TextLink';

function FocusModeNotification() {
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    useEffect(() => {
        User.updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, true);
    }, []);

    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={User.clearFocusModeNotification}
            shouldShowCancelButton={false}
            prompt={
                <Text>
                    {translate('focusModeUpdateModal.prompt')}
                    <TextLinkWithRef
                        href={`${environmentURL}/settings/preferences/priority-mode`}
                        style={styles.link}
                    >
                        {translate('common.here')}
                    </TextLinkWithRef>
                    .
                </Text>
            }
            isVisible
        />
    );
}

FocusModeNotification.displayName = 'FocusModeNotification';
export default FocusModeNotification;
