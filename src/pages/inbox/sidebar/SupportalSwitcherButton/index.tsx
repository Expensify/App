import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import {PressableWithoutFeedback} from '@components/Pressable';
import TextInput from '@components/TextInput';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import {getSupportalReason} from '@libs/actions/Session';
import {getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import addTrailingForwardSlash from '@libs/UrlUtils';

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
    const {isOffline} = useNetwork();

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [isReasonRequired, setIsReasonRequired] = useState(false);
    const [isCheckingReason, setIsCheckingReason] = useState(false);

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

    const closeSwitcher = () => {
        setIsPopoverVisible(false);
        setEmail('');
        setReason('');
        setIsReasonRequired(false);
    };

    // OldDot mints the support token behind Cloudflare on the agent's own session. buildOldDotURL would append
    // the customer's email, which OldDot then checks against the agent's cookie and bounces to /signin.
    const switchToAccount = (target: string, supportReason: string) => {
        closeSwitcher();
        getOldDotEnvironmentURL().then((environmentURL) => {
            openExternalLink(`${addTrailingForwardSlash(environmentURL)}${CONST.OLDDOT_URLS.SUPPORTAL_LOGIN_NEWDOT(target, supportReason)}`, undefined, true);
        });
    };

    const submitEmail = () => {
        const target = email.trim();
        if (!target || isCheckingReason || isOffline) {
            return;
        }

        setIsCheckingReason(true);
        getSupportalReason(target)
            .then((derivedReason) => {
                if (!derivedReason) {
                    setIsReasonRequired(true);
                    return;
                }
                switchToAccount(target, '');
            })
            .finally(() => setIsCheckingReason(false));
    };

    const submitReason = () => {
        const target = email.trim();
        const enteredReason = reason.trim();
        if (!target || !enteredReason || isOffline) {
            return;
        }
        switchToAccount(target, enteredReason);
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
                        // The FAB below adds 16 of its own top padding, so pull back 4 to match its 12 gap.
                        style={[styles.navigationTabBarFABItem, styles.mbn1]}
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
                onClose={closeSwitcher}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                anchorAlignment={ANCHOR_ALIGNMENT}
            >
                <View style={[styles.createMenuContainer, styles.ph5]}>
                    <TextInput
                        label={translate('supportalSwitcher.title')}
                        accessibilityLabel={translate('supportalSwitcher.emailLabel')}
                        placeholder={translate('supportalSwitcher.emailLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        value={email}
                        onChangeText={setEmail}
                        onSubmitEditing={submitEmail}
                        editable={!isCheckingReason && !isReasonRequired}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="go"
                    />
                    {isReasonRequired && (
                        <View style={styles.mt3}>
                            <TextInput
                                label={translate('supportalSwitcher.reasonLabel')}
                                accessibilityLabel={translate('supportalSwitcher.reasonLabel')}
                                hint={translate('supportalSwitcher.reasonHint')}
                                role={CONST.ROLE.PRESENTATION}
                                value={reason}
                                onChangeText={setReason}
                                onSubmitEditing={submitReason}
                                autoFocus
                                spellCheck={false}
                                enterKeyHint="go"
                            />
                        </View>
                    )}
                    <Button
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={styles.mt3}
                        accessibilityLabel={translate('supportalSwitcher.login')}
                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.SUPPORTAL_SWITCHER_BUTTON}
                        onPress={isReasonRequired ? submitReason : submitEmail}
                        isLoading={isCheckingReason}
                        isDisabled={isOffline || !email.trim() || (isReasonRequired && !reason.trim())}
                    >
                        <Button.Text>{translate('supportalSwitcher.login')}</Button.Text>
                    </Button>
                </View>
            </PopoverWithMeasuredContent>
        </>
    );
}

SupportalSwitcherButton.displayName = 'SupportalSwitcherButton';

export default SupportalSwitcherButton;
