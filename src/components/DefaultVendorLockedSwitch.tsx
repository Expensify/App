/**
 * Locked enable toggle for a workspace's default vendor with an interactive tooltip linking to accounting export settings.
 */
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

import Switch from './Switch';
import Text from './Text';
import TextLink from './TextLink';
import InteractiveTooltip, {useInteractiveTooltipActions} from './Tooltip/InteractiveTooltip';

type DefaultVendorLockedSwitchTriggerProps = {
    accessibilityLabel: string;
    sentryLabel: SentryLabel;
    onToggle: (enabled: boolean) => void;
    isNested?: boolean;
};

function DefaultVendorLockedSwitchTrigger({accessibilityLabel, sentryLabel, onToggle, isNested}: DefaultVendorLockedSwitchTriggerProps) {
    const {openTooltip} = useInteractiveTooltipActions();

    return (
        <Switch
            isOn
            accessibilityLabel={accessibilityLabel}
            sentryLabel={sentryLabel}
            onToggle={onToggle}
            disabled
            disabledAction={openTooltip}
            showLockIcon
            isNested={isNested}
            shouldAnimateOnExternalChange
        />
    );
}

type DefaultVendorTooltipBodyProps = {
    accountingExportRoute: Route;
    sentryLabel: SentryLabel;
};

function DefaultVendorTooltipBody({accountingExportRoute, sentryLabel}: DefaultVendorTooltipBodyProps) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {closeTooltip} = useInteractiveTooltipActions();

    const openAccountingExportSettings = () => {
        closeTooltip();
        Navigation.navigate(accountingExportRoute);
    };

    return (
        <Text
            variant="micro"
            color={theme.textReversed}
            textAlign="center"
        >
            {translate('workspace.vendors.defaultVendorTooltipPrefix')}{' '}
            <TextLink
                variant="micro"
                style={StyleUtils.getColorStyle(theme.linkReversed)}
                sentryLabel={sentryLabel}
                onPress={openAccountingExportSettings}
            >
                {translate('workspace.vendors.accountingExportSettings')}
            </TextLink>
            .
        </Text>
    );
}

type DefaultVendorLockedSwitchProps = {
    accessibilityLabel: string;

    /** Destination route for the tooltip's accounting export settings link. */
    accountingExportRoute: Route;

    onToggle: (enabled: boolean) => void;
    switchSentryLabel: SentryLabel;
    linkSentryLabel: SentryLabel;

    /** Passed to `Switch` when rendered inside a pressable container such as a table row. */
    isNested?: boolean;

    /** Reports the rendered tooltip root element on web so callers can register it with a focus trap. */
    onTooltipElementChange?: (element: HTMLElement | null) => void;
};

function DefaultVendorLockedSwitch({
    accessibilityLabel,
    accountingExportRoute,
    onToggle,
    switchSentryLabel,
    linkSentryLabel,
    isNested,
    onTooltipElementChange,
}: DefaultVendorLockedSwitchProps) {
    return (
        <InteractiveTooltip.Root
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            onTooltipElementChange={onTooltipElementChange}
        >
            <InteractiveTooltip.Trigger>
                <DefaultVendorLockedSwitchTrigger
                    accessibilityLabel={accessibilityLabel}
                    sentryLabel={switchSentryLabel}
                    onToggle={onToggle}
                    isNested={isNested}
                />
            </InteractiveTooltip.Trigger>
            <InteractiveTooltip.Content>
                <DefaultVendorTooltipBody
                    accountingExportRoute={accountingExportRoute}
                    sentryLabel={linkSentryLabel}
                />
            </InteractiveTooltip.Content>
        </InteractiveTooltip.Root>
    );
}

export default DefaultVendorLockedSwitch;
