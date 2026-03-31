import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useInboxPanelActions} from './InboxPanelContext';

type InboxPanelToggleButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function InboxPanelToggleButton({style}: InboxPanelToggleButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {togglePanel} = useInboxPanelActions();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('common.inbox')}
            onPress={togglePanel}
            role={CONST.ROLE.BUTTON}
            style={style}
        >
            <Text style={styles.textBlue}>{translate('common.inbox')}</Text>
        </PressableWithoutFeedback>
    );
}

export default InboxPanelToggleButton;
