import Icon from '@components/Icon';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import {PressableWithoutFeedback} from '@components/Pressable';
import TextInput from '@components/TextInput';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openOldDotLink} from '@libs/actions/Link';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';

import {canSupportLoginSelector} from '@selectors/Account';
import {isSupportalSessionSelector} from '@selectors/Session';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

type SupportalSwitcherButtonProps = {
    /** Whether the pointer is currently over the navigation sidebar */
    isSidebarHovered: boolean;
};

function SupportalSwitcherButton({isSidebarHovered}: SupportalSwitcherButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['UserSearch']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [email, setEmail] = useState('');

    const [canSupportLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canSupportLoginSelector});
    const [isSupportalSession] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});

    // During supportal the account is the customer, so canSupportLogin goes false while switching.
    const isSupportAgent = (canSupportLogin ?? false) || !!isSupportalSession;

    const openSwitcher = () => {
        calculatePopoverPosition(anchorRef, ANCHOR_ALIGNMENT).then((position) => {
            setAnchorPosition(position);
            setIsPopoverVisible(true);
        });
    };

    const switchToAccount = () => {
        const target = email.trim();
        if (!target) {
            return;
        }
        setIsPopoverVisible(false);
        setEmail('');

        // OldDot mints the support token behind Cloudflare and redirects back to /transition.
        openOldDotLink(CONST.OLDDOT_URLS.SUPPORTAL_LOGIN_NEWDOT(target), true);
    };

    if (!isSupportAgent) {
        return null;
    }

    return (
        <>
            {(isSidebarHovered || isPopoverVisible) && (
                <Tooltip text={translate('supportalSwitcher.title')}>
                    <PressableWithoutFeedback
                        ref={anchorRef}
                        style={styles.navigationTabBarFABItem}
                        accessibilityLabel={translate('supportalSwitcher.title')}
                        role={CONST.ROLE.BUTTON}
                        onPress={openSwitcher}
                        testID="supportal-switcher-button"
                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.SUPPORTAL_SWITCHER_BUTTON}
                    >
                        {({hovered}) => (
                            <View
                                style={[
                                    styles.floatingActionButton,
                                    styles.floatingActionButtonSmall,
                                    StyleUtils.getBackgroundColorStyle(hovered ? theme.buttonHoveredBG : theme.buttonDefaultBG),
                                ]}
                            >
                                <Icon
                                    src={icons.UserSearch}
                                    fill={theme.icon}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                />
                            </View>
                        )}
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
            <PopoverWithMeasuredContent
                isVisible={isPopoverVisible}
                onClose={() => setIsPopoverVisible(false)}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                anchorAlignment={ANCHOR_ALIGNMENT}
            >
                <View style={[styles.p5, styles.supportalSwitcherPopoverWidth]}>
                    <TextInput
                        label={translate('supportalSwitcher.title')}
                        accessibilityLabel={translate('supportalSwitcher.emailLabel')}
                        placeholder={translate('supportalSwitcher.emailLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        value={email}
                        onChangeText={setEmail}
                        onSubmitEditing={switchToAccount}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="go"
                    />
                </View>
            </PopoverWithMeasuredContent>
        </>
    );
}

SupportalSwitcherButton.displayName = 'SupportalSwitcherButton';

export default SupportalSwitcherButton;
