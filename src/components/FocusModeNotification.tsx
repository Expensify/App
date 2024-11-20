import React, {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';
import TextLinkWithRef from './TextLink';

function FocusModeNotification() {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    useEffect(() => {
        User.updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, true);
    }, []);
    const href = `${environmentURL}/settings/preferences/priority-mode`;
    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={User.clearFocusModeNotification}
            shouldShowCancelButton={false}
            onBackdropPress={User.clearFocusModeNotification}
            onCancel={User.clearFocusModeNotification}
            prompt={
                <Text>
                    {translate('focusModeUpdateModal.prompt')}
                    <TextLinkWithRef
                        style={styles.link}
                        onPress={() => {
                            User.clearFocusModeNotification();
                            Link.openLink(href, environmentURL);
                        }}
                    >
                        {translate('focusModeUpdateModal.settings')}
                    </TextLinkWithRef>
                    .
                </Text>
            }
            isVisible
            image={Illustrations.ThreeLeggedLaptopWoman}
            titleStyles={[styles.textHeadline, styles.mbn3]}
        />
    );
}

FocusModeNotification.displayName = 'FocusModeNotification';
export default FocusModeNotification;
