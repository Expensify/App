import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearDelegatorErrors, connect, disconnect} from '@libs/actions/Delegate';
import {close} from '@libs/actions/Modal';
import {getLatestError} from '@libs/ErrorUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {PopoverMenuItem} from './PopoverMenu';
import PopoverMenu from './PopoverMenu';
import {PressableWithFeedback} from './Pressable';
import {useProductTrainingContext} from './ProductTrainingContext';
import Text from './Text';
import Tooltip from './Tooltip';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type AccountSwitcherProps = {
    /* Whether the screen is focused. Used to hide the product training tooltip */
    isScreenFocused: boolean;
};

function AccountSwitcher({isScreenFocused}: AccountSwitcherProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const buttonRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const {canUseLeftHandBar} = usePermissions();

    const [shouldShowDelegatorMenu, setShouldShowDelegatorMenu] = useState(false);
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const canSwitchAccounts = delegators.length > 0 || isActingAsDelegate;
    const accountSwitcherPopoverStyle = canUseLeftHandBar ? styles.accountSwitcherPopoverWithLHB : styles.accountSwitcherPopover;

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER,
        isScreenFocused && canSwitchAccounts,
    );

    const onPressSwitcher = () => {
        hideProductTrainingTooltip();
        setShouldShowDelegatorMenu(!shouldShowDelegatorMenu);
    };

    const TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip : Tooltip;
    const tooltipProps = shouldShowProductTrainingTooltip
        ? {
              shouldRender: shouldShowProductTrainingTooltip,
              renderTooltipContent: renderProductTrainingTooltip,
              anchorAlignment: {
                  horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                  vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
              },
              shiftVertical: variables.accountSwitcherTooltipShiftVertical,
              shiftHorizontal: variables.accountSwitcherTooltipShiftHorizontal,
              wrapperStyle: styles.productTrainingTooltipWrapper,
              onTooltipPress: onPressSwitcher,
          }
        : {
              text: translate('delegate.copilotAccess'),
              shiftVertical: 8,
              shiftHorizontal: 8,
              anchorAlignment: {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM},
              shouldRender: canSwitchAccounts,
          };

    const createBaseMenuItem = (
        personalDetails: PersonalDetails | undefined,
        errors?: Errors,
        additionalProps: Partial<Omit<PopoverMenuItem, 'icon' | 'iconType'>> = {},
    ): PopoverMenuItem => {
        const error = Object.values(errors ?? {}).at(0) ?? '';
        return {
            text: personalDetails?.displayName ?? personalDetails?.login ?? '',
            description: Str.removeSMSDomain(personalDetails?.login ?? ''),
            avatarID: personalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            icon: personalDetails?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            outerWrapperStyle: shouldUseNarrowLayout ? {} : accountSwitcherPopoverStyle,
            numberOfLinesDescription: 1,
            errorText: error ?? '',
            shouldShowRedDotIndicator: !!error,
            errorTextStyle: styles.mt2,
            ...additionalProps,
        };
    };

    const menuItems = (): PopoverMenuItem[] => {
        const currentUserMenuItem = createBaseMenuItem(currentUserPersonalDetails, undefined, {
            shouldShowRightIcon: true,
            iconRight: Expensicons.Checkmark,
            success: true,
            isSelected: true,
        });

        if (isActingAsDelegate) {
            const delegateEmail = account?.delegatedAccess?.delegate ?? '';

            // Avoid duplicating the current user in the list when switching accounts
            if (delegateEmail === currentUserPersonalDetails.login) {
                return [currentUserMenuItem];
            }

            const delegatePersonalDetails = getPersonalDetailByEmail(delegateEmail);
            const error = getLatestError(account?.delegatedAccess?.errorFields?.disconnect);

            return [
                createBaseMenuItem(delegatePersonalDetails, error, {
                    onSelected: () => {
                        if (isOffline) {
                            close(() => setShouldShowOfflineModal(true));
                            return;
                        }
                        disconnect();
                    },
                }),
                currentUserMenuItem,
            ];
        }

        const delegatorMenuItems: PopoverMenuItem[] = delegators
            .filter(({email}) => email !== currentUserPersonalDetails.login)
            .map(({email, role}) => {
                const errorFields = account?.delegatedAccess?.errorFields ?? {};
                const error = getLatestError(errorFields?.connect?.[email]);
                const personalDetails = getPersonalDetailByEmail(email);
                return createBaseMenuItem(personalDetails, error, {
                    badgeText: translate('delegate.role', {role}),
                    onSelected: () => {
                        if (isOffline) {
                            close(() => setShouldShowOfflineModal(true));
                            return;
                        }
                        connect(email);
                    },
                });
            });

        return [currentUserMenuItem, ...delegatorMenuItems];
    };

    const hideDelegatorMenu = () => {
        setShouldShowDelegatorMenu(false);
        clearDelegatorErrors();
    };

    return (
        <>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <TooltipToRender {...tooltipProps}>
                <PressableWithFeedback
                    accessible
                    accessibilityLabel={translate('common.profile')}
                    onPress={onPressSwitcher}
                    ref={buttonRef}
                    interactive={canSwitchAccounts}
                    pressDimmingValue={canSwitchAccounts ? undefined : 1}
                    wrapperStyle={[styles.flexGrow1, styles.flex1, styles.mnw0, styles.justifyContentCenter]}
                >
                    <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar
                            type={CONST.ICON_TYPE_AVATAR}
                            size={CONST.AVATAR_SIZE.DEFAULT}
                            avatarID={currentUserPersonalDetails?.accountID}
                            source={currentUserPersonalDetails?.avatar}
                            fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                        />
                        <View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter, styles.gap1]}>
                            <View style={[styles.flexRow, styles.gap1]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.textBold, styles.textLarge, styles.flexShrink1, styles.lineHeightXLarge]}
                                >
                                    {currentUserPersonalDetails?.displayName}
                                </Text>
                                {!!canSwitchAccounts && (
                                    <View style={styles.justifyContentCenter}>
                                        <Icon
                                            fill={theme.icon}
                                            src={Expensicons.CaretUpDown}
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                        />
                                    </View>
                                )}
                            </View>
                            <Text
                                numberOfLines={1}
                                style={[styles.colorMuted, styles.fontSizeLabel]}
                            >
                                {Str.removeSMSDomain(currentUserPersonalDetails?.login ?? '')}
                            </Text>
                            {!!account?.isDebugModeEnabled && (
                                <Text
                                    style={[styles.textLabelSupporting, styles.mt1, styles.w100]}
                                    numberOfLines={1}
                                >
                                    AccountID: {session?.accountID}
                                </Text>
                            )}
                        </View>
                    </View>
                </PressableWithFeedback>
            </TooltipToRender>

            {!!canSwitchAccounts && (
                <PopoverMenu
                    isVisible={shouldShowDelegatorMenu}
                    onClose={hideDelegatorMenu}
                    onItemSelected={hideDelegatorMenu}
                    anchorRef={buttonRef}
                    anchorPosition={CONST.POPOVER_ACCOUNT_SWITCHER_POSITION}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    menuItems={menuItems()}
                    headerText={translate('delegate.switchAccount')}
                    containerStyles={[{maxHeight: windowHeight / 2}, styles.pb0, styles.mw100, shouldUseNarrowLayout ? {} : styles.wFitContent]}
                    headerStyles={styles.pt0}
                    innerContainerStyle={styles.pb0}
                    scrollContainerStyle={styles.pb4}
                    shouldUseScrollView
                    shouldUpdateFocusedIndex={false}
                />
            )}
            <ConfirmModal
                title={translate('common.youAppearToBeOffline')}
                isVisible={shouldShowOfflineModal}
                onConfirm={() => setShouldShowOfflineModal(false)}
                onCancel={() => setShouldShowOfflineModal(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('common.offlinePrompt')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

AccountSwitcher.displayName = 'AccountSwitcher';

export default AccountSwitcher;
