import React from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import colors from '@styles/theme/colors';
import ConfirmModal from './ConfirmModal';
import {ThreeLeggedLaptopWoman} from './Icon/Illustrations';
import Text from './Text';
import TextLinkWithRef from './TextLink';

type FocusModeNotificationProps = {
    onClose: () => void;
};

function FocusModeNotification({onClose}: FocusModeNotificationProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const href = `${environmentURL}/settings/preferences/priority-mode`;

    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={onClose}
            shouldShowCancelButton={false}
            onBackdropPress={onClose}
            onCancel={onClose}
            prompt={
                <Text>
                    {translate('focusModeUpdateModal.prompt')}
                    <TextLinkWithRef
                        style={styles.link}
                        onPress={() => {
                            onClose();
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
