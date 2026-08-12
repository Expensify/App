import ActivityIndicator from '@components/ActivityIndicator';
import {useHeaderContext} from '@components/HeaderWithBackButtonComposed/context';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type HeaderRotateButtonProps = {
    /** Method to trigger when pressing the rotate button. */
    onPress?: () => void;

    /** Whether we should show a loading indicator replacing the rotate button. */
    isLoading?: boolean;
};

function HeaderRotateButton({onPress = () => {}, isLoading = false}: HeaderRotateButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Rotate']);
    const {iconFill} = useHeaderContext();

    if (isLoading) {
        return <ActivityIndicator style={[styles.touchableButtonImage]} />;
    }

    return (
        <Tooltip text={translate('common.rotate')}>
            <PressableWithoutFeedback
                onPress={onPress}
                style={[styles.touchableButtonImage]}
                role="button"
                accessibilityLabel={translate('common.rotate')}
                sentryLabel={CONST.SENTRY_LABEL.HEADER.ROTATE_BUTTON}
            >
                <Icon
                    src={icons.Rotate}
                    fill={iconFill ?? theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default HeaderRotateButton;
export type {HeaderRotateButtonProps};
