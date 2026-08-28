import useInitialFocusRef from '@hooks/useInitialFocusRef';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard} from 'react-native';

import HeaderIconButton from './HeaderIconButton';

type HeaderBackButtonProps = {
    /** Method to trigger when pressing the back button of the header. Defaults to `Navigation.goBack()`. */
    onPress?: () => void;

    /** Optional fill color for the icon. */
    iconFill?: string;

    /** Whether to skip focus of the back button after the RHP transition (screen reader). */
    shouldSkipFocusAfterTransition?: boolean;
};

function HeaderBackButton({onPress = () => Navigation.goBack(), iconFill, shouldSkipFocusAfterTransition = false}: HeaderBackButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const setBackButtonRef = useInitialFocusRef({shouldSkip: shouldSkipFocusAfterTransition});

    return (
        <HeaderIconButton
            ref={setBackButtonRef}
            tooltipText={translate('common.back')}
            onPress={() => {
                if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                }
                onPress();
            }}
            iconSrc={icons.BackArrow}
            iconFill={iconFill}
            // Header makes the space for this button with the padding, so we need to add negative margin to fill the space
            style={styles.mln3}
            id={CONST.BACK_BUTTON_NATIVE_ID}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.BACK_BUTTON}
        />
    );
}

export default HeaderBackButton;
