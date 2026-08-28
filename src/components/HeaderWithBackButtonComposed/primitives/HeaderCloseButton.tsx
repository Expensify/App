import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import HeaderTooltipIconButton from './HeaderTooltipIconButton';

type HeaderCloseButtonProps = {
    /** Method to trigger when pressing the close button of the header. */
    onPress: () => void;
    /** The fill color for the close icon. */
    iconFill?: string;
};

/**
 * Close button. Renders what the legacy `shouldShowCloseButton` branch rendered: a tooltip-wrapped close icon button.
 */
function HeaderCloseButton({onPress, iconFill}: HeaderCloseButtonProps) {
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

export default HeaderCloseButton;
