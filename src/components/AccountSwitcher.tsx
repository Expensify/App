import {accountIDSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearDelegatorErrors, connect, disconnect} from '@libs/actions/Delegate';
import {close} from '@libs/actions/Modal';
import {getLatestError} from '@libs/ErrorUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
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
    const icons = useMemoizedLazyExpensifyIcons(['CaretUpDown']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {localeCompare, translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const buttonRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();

    const [shouldShowDelegatorMenu, setShouldShowDelegatorMenu] = useState(false);
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const delegators = account?.delegatedAccess?.delegators ?? [];

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const canSwitchAccounts = delegators.length > 0 || isActingAsDelegate;
    const displayName = currentUserPersonalDetails?.displayName ?? '';
    const doesDisplayNameContainEmojis = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g')).test(displayName);

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
            outerWrapperStyle: shouldUseNarrowLayout ? {} : styles.accountSwitcherPopover,
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
                        disconnect({stashedCredentials, stashedSession});
                    },
                }),
                currentUserMenuItem,
            ];
        }

        const delegatorMenuItems: PopoverMenuItem[] = sortAlphabetically(
            delegators
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
                            connect({email, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID});
                        },
                    });
                }),
            'text',
            localeCompare,
        );

        return [currentUserMenuItem, ...delegatorMenuItems];
    };

    const hideDelegatorMenu = () => {
        setShouldShowDelegatorMenu(false);
        clearDelegatorErrors({delegatedAccess: account?.delegatedAccess});
    };

    return (
        <>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <TooltipToRender {...tooltipProps}>
                <PressableWithFeedback
                    accessible
                    accessibilityLabel={`${translate('common.profile')}, ${displayName}, ${Str.removeSMSDomain(currentUserPersonalDetails?.login ?? '')}`}
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
                                {doesDisplayNameContainEmojis ? (
                                    <Text numberOfLines={1}>
                                        <TextWithEmojiFragment
                                            message={displayName}
                                            style={[styles.textBold, styles.textLarge, styles.flexShrink1, styles.lineHeightXLarge]}
                                        />
                                    </Text>
                                ) : (
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textBold, styles.textLarge, styles.flexShrink1, styles.lineHeightXLarge]}
                                    >
                                        {formatPhoneNumber(displayName)}
                                    </Text>
                                )}
                                {!!canSwitchAccounts && (
                                    <View style={styles.justifyContentCenter}>
                                        <Icon
                                            fill={theme.icon}
                                            src={icons.CaretUpDown}
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
                            {!!isDebugModeEnabled && (
                                <Text
                                    style={[styles.textLabelSupporting, styles.mt1, styles.w100]}
                                    numberOfLines={1}
                                >
                                    AccountID: {accountID}
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

export default AccountSwitcher;
