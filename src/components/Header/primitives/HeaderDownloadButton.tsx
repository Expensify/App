import ActivityIndicator from '@components/ActivityIndicator';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';

import HeaderIconButton from './HeaderIconButton';

type HeaderDownloadButtonProps = {
    /** Method to trigger when pressing the download button. */
    onPress: () => void;

    /** Whether we should show a loading indicator replacing the download button. */
    isLoading?: boolean;

    /** Optional fill color for the icon. */
    iconFill?: string;
};

function HeaderDownloadButton({onPress, isLoading = false, iconFill}: HeaderDownloadButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const [isDownloadButtonActive, temporarilyDisableDownloadButton] = useThrottledButtonState();

    if (isLoading) {
        return <ActivityIndicator style={[styles.touchableButtonImage]} />;
    }

    return (
        <HeaderIconButton
            tooltipText={translate('common.download')}
            onPress={(event) => {
                // Blur to avoid overlapping a Growl notification with the Tooltip (#15271)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- web-only DOM interop to blur the pressable
                (event?.currentTarget as HTMLElement)?.blur();

                if (!isDownloadButtonActive) {
                    return;
                }

                onPress();
                temporarilyDisableDownloadButton();
            }}
            iconSrc={icons.Download}
            iconFill={iconFill ?? StyleUtils.getIconFillColor({buttonState: getButtonState({isComplete: !isDownloadButtonActive})})}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.DOWNLOAD_BUTTON}
        />
    );
}

export default HeaderDownloadButton;
