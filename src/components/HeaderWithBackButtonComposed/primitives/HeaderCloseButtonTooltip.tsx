import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

type HeaderCloseButtonTooltipProps = {
    /** Method to trigger when pressing the close button of the header. Defaults to `Navigation.dismissModal()`. */
    onPress?: () => void;
    /** The fill color for the close icon. */
    iconFill?: string;
};

/**
 * Close button. Renders what the legacy `shouldShowCloseButton` branch rendered — a tooltip-wrapped close icon button.
 */
function HeaderCloseButtonTooltip({onPress = () => Navigation.dismissModal(), iconFill}: HeaderCloseButtonTooltipProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    return (
        <Tooltip text={translate('common.close')}>
            <PressableWithoutFeedback
                onPress={onPress}
                style={[styles.touchableButtonImage]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.close')}
                sentryLabel={CONST.SENTRY_LABEL.HEADER.CLOSE_BUTTON}
            >
                <Icon
                    src={icons.Close}
                    fill={iconFill ?? theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default HeaderCloseButtonTooltip;
export type {HeaderCloseButtonTooltipProps};
