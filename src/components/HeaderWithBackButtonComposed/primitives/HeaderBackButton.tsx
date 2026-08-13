import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import useInitialFocusRef from '@hooks/useInitialFocusRef';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard} from 'react-native';

type HeaderBackButtonProps = {
    /** Method to trigger when pressing the back button of the header. Defaults to `Navigation.goBack()`. */
    onPress?: () => void;

    /** Optional fill color for the icon. */
    iconFill?: string;

    /** Whether to skip focus of the back button after the RHP transition (screen reader). */
    shouldSkipFocusAfterTransition?: boolean;
};

function HeaderBackButton({onPress = () => Navigation.goBack(), iconFill, shouldSkipFocusAfterTransition = false}: HeaderBackButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const setBackButtonRef = useInitialFocusRef({shouldSkip: shouldSkipFocusAfterTransition});

    return (
        <Tooltip text={translate('common.back')}>
            <PressableWithoutFeedback
                ref={setBackButtonRef}
                onPress={() => {
                    if (Keyboard.isVisible()) {
                        Keyboard.dismiss();
                    }
                    onPress();
                }}
                // Header makes the space for this button with the padding, so we need to add negative margin to fill the space
                style={[styles.touchableButtonImage, styles.mln3]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.back')}
                id={CONST.BACK_BUTTON_NATIVE_ID}
                sentryLabel={CONST.SENTRY_LABEL.HEADER.BACK_BUTTON}
            >
                <Icon
                    src={icons.BackArrow}
                    fill={iconFill ?? theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default HeaderBackButton;
