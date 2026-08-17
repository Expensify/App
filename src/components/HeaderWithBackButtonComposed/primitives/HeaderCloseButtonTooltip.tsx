import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import HeaderTooltipIconButton from './HeaderTooltipIconButton';

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
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    return (
        <HeaderTooltipIconButton
            text={translate('common.close')}
            onPress={onPress}
            iconSrc={icons.Close}
            iconFill={iconFill}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.CLOSE_BUTTON}
        />
    );
}

export default HeaderCloseButtonTooltip;
