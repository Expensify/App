/** The supportal switcher popover: the form that signs a support agent into another account. Desktop web only, see the native stubs of its triggers. */
import Button from '@components/Button';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import TextInput from '@components/TextInput';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useShouldAddBottomSafeAreaPadding from '@hooks/useShouldAddBottomSafeAreaPadding';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import {getSupportalReason} from '@libs/actions/Session';
import {getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import addTrailingForwardSlash from '@libs/UrlUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import type {RefObject} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import {SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT} from './useSupportalSwitcherAnchor';

type SupportalSwitcherPopoverProps = {
    isVisible: boolean;

    /** The trigger the popover opens from */
    anchorRef: RefObject<HTMLDivElement | null>;

    anchorPosition: AnchorPosition;

    /** Called after the form resets, on dismiss or once the switch starts */
    onClose: () => void;

    /** Called once the popover has fully closed and its modal is gone from the screen */
    onModalHide?: () => void;
};

function SupportalSwitcherPopover({isVisible, anchorRef, anchorPosition, onClose, onModalHide}: SupportalSwitcherPopoverProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const shouldAddBottomSafeAreaPadding = useShouldAddBottomSafeAreaPadding();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: shouldAddBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: [styles.createMenuContainer, styles.ph5],
        additionalPaddingBottom: variables.componentBorderRadiusLarge,
    });

    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [isReasonRequired, setIsReasonRequired] = useState(false);
    const [isCheckingReason, setIsCheckingReason] = useState(false);

    const closeSwitcher = () => {
        onClose();
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

    return (
        <PopoverWithMeasuredContent
            isVisible={isVisible}
            onClose={closeSwitcher}
            onModalHide={onModalHide}
            anchorRef={anchorRef}
            anchorPosition={anchorPosition}
            anchorAlignment={SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>
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
    );
}

export default SupportalSwitcherPopover;
