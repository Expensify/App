import {useHeaderContext} from '@components/Header/context/HeaderContext';

import useInitialFocusRef from '@hooks/useInitialFocusRef';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import {Keyboard} from 'react-native';

import HeaderIconButton from './HeaderIconButton';

type HeaderBackButtonProps = {
    /** Method to trigger when pressing the back button of the header. Defaults to `Navigation.goBack()`. */
    onPress?: () => void;

    /** Optional fill color for the icon. */
    iconFill?: string;

    /** Sentry label for the button, for a back button whose presses belong to its own area. Defaults to the generic header back button label. */
    sentryLabel?: SentryLabel;
};

function HeaderBackButton({onPress = () => Navigation.goBack(), iconFill, sentryLabel = CONST.SENTRY_LABEL.HEADER.BACK_BUTTON}: HeaderBackButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const {shouldSkipFocusAfterTransition} = useHeaderContext();
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
            // Header makes the space for this button with the padding, so we need to add negative margin to fill the space - instead of reducing the padding from pl5 to pl2
            style={styles.mln3}
            id={CONST.BACK_BUTTON_NATIVE_ID}
            sentryLabel={sentryLabel}
        />
    );
}

export default HeaderBackButton;
