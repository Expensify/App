import React, {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import {clearFocusModeNotification, updateChatPriorityMode} from '@libs/actions/User';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';
import {ThreeLeggedLaptopWoman} from './Icon/Illustrations';
import Text from './Text';
import TextLinkWithRef from './TextLink';

function FocusModeNotification() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    useEffect(() => {
        updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, true);
    }, []);
    const href = `${environmentURL}/settings/preferences/priority-mode`;
    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={clearFocusModeNotification}
            shouldShowCancelButton={false}
            onBackdropPress={clearFocusModeNotification}
            onCancel={clearFocusModeNotification}
            prompt={
                <Text>
                    {translate('focusModeUpdateModal.prompt')}
                    <TextLinkWithRef
                        style={styles.link}
                        onPress={() => {
                            clearFocusModeNotification();
                            openLink(href, environmentURL);
                        }}
                    >
                        {translate('focusModeUpdateModal.settings')}
                    </TextLinkWithRef>
                    .
                </Text>
            }
            isVisible
            image={ThreeLeggedLaptopWoman}
            imageStyles={StyleUtils.getBackgroundColorStyle(colors.pink800)}
            titleStyles={[styles.textHeadline, styles.mbn3]}
        />
    );
}

FocusModeNotification.displayName = 'FocusModeNotification';
export default FocusModeNotification;
