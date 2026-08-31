import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {clearDelegatorErrors, connect, disconnect} from '@libs/actions/Delegate';
import {close} from '@libs/actions/Modal';
import {getLatestError} from '@libs/ErrorUtils';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {PersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {accountIDSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {PopoverMenuItem} from './PopoverMenu';

import UserAvatar from './Avatar/UserAvatar';
import Button from './ButtonComposed';
import {ModalActions} from './Modal/Global/ModalContext';
import PopoverMenu from './PopoverMenu';
import {useProductTrainingContext} from './ProductTrainingContext';
import Text from './Text';
import Tooltip from './Tooltip';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type AccountSwitcherProps = {
    /* Whether the screen is focused. Used to hide the product training tooltip */
    isScreenFocused: boolean;
};

const filterMenuItem = (item: PopoverMenuItem, searchInput: string) => tokenizedSearch([item], searchInput, (option) => [option.text, option.description ?? '']).length > 0;

function AccountSwitcher({isScreenFocused}: AccountSwitcherProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const icons = useMemoizedLazyExpensifyIcons(['CaretUpDown']);
    const styles = useThemeStyles();
    const {localeCompare, translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const delegate = account?.delegatedAccess?.delegate;
    const delegators = account?.delegatedAccess?.delegators ?? [];
    const personalDetailsByLogin = usePersonalDetailsByLogins([delegate, ...delegators.map((delegator) => delegator.email)]);

    const buttonRef = useRef<View>(null);
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {calculatePopoverPosition} = usePopoverPosition();

    const [shouldShowDelegatorMenu, setShouldShowDelegatorMenu] = useState(false);
    // Measured from the Switch button so the menu opens directly below it, rather than a fixed position.
    const [popoverPosition, setPopoverPosition] = useState<AnchorPosition>();

    const isActingAsDelegate = !!delegate;
    const canSwitchAccounts = delegators.length > 0 || isActingAsDelegate;
    const displayName = currentUserPersonalDetails.displayName ?? '';
    const doesDisplayNameContainEmojis = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g')).test(displayName);

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER,
        isScreenFocused && canSwitchAccounts,
    );

    const {showConfirmModal} = useConfirmModal();

    const showOfflineModal = () => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const showGpsInProgressModal = async (switchAccount: () => ReturnType<typeof connect | typeof disconnect>) => {
        const result = await showConfirmModal({
            title: translate('gps.switchAccountWarningTripInProgress.title'),
            prompt: translate('gps.switchAccountWarningTripInProgress.prompt'),
            confirmText: translate('gps.switchAccountWarningTripInProgress.confirm'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        await stopGpsTrip(false, getGpsPoints(gpsDraftDetails), true);

        switchAccount();
    };

    // Anchor the menu to the bottom-right of the Switch button so it opens directly below it.
    const measureDelegatorMenuPosition = useCallback(
        () =>
            calculatePopoverPosition(buttonRef, {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }),
        [calculatePopoverPosition],
    );

    const onPressSwitcher = () => {
        hideProductTrainingTooltip();
        if (shouldShowDelegatorMenu) {
            setShouldShowDelegatorMenu(false);
            return;
        }
        // Measure the button before opening so the menu renders at the right spot on the first frame.
        measureDelegatorMenuPosition().then((position) => {
            setPopoverPosition(position);
            setShouldShowDelegatorMenu(true);
        });
    };

    // Keep the menu anchored to the button if the window is resized while it is open.
    useLayoutEffect(() => {
        if (!shouldShowDelegatorMenu) {
            return;
        }
        measureDelegatorMenuPosition().then(setPopoverPosition);
    }, [shouldShowDelegatorMenu, windowWidth, windowHeight, measureDelegatorMenuPosition]);

    const TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip : Tooltip;
    const tooltipProps = shouldShowProductTrainingTooltip
        ? {
              shouldRender: shouldShowProductTrainingTooltip,
              renderTooltipContent: renderProductTrainingTooltip,
              anchorAlignment: {
                  // Right-align so the tooltip opens leftward into the sidebar (matching the design mockup),
                  // instead of overflowing past the Switch button into the central pane.
                  horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                  vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
              },
              shiftVertical: variables.accountSwitcherTooltipShiftVertical,
              shiftHorizontal: variables.accountSwitcherTooltipShiftHorizontal,
              wrapperStyle: styles.productTrainingTooltipWrapper,
              onTooltipPress: onPressSwitcher,
              // The switcher lives in the settings sidebar, which isn't the navigation-focused screen on wide layouts.
              // Without this the educational tooltip is suppressed (it relies on the screen being focused), so keep it shown until dismissed.
              shouldHideOnNavigate: false,
              // The switcher scrolls away with the settings list, so the tooltip has to follow it or get out of the way.
              shouldHideOnScroll: true,
          }
        : {
              text: translate('delegate.copilotAccess'),
              shouldRender: canSwitchAccounts,
          };

    const createBaseMenuItem = (
        personalDetails: PersonalDetails | undefined,
        errors?: Errors,
        additionalProps: Partial<Omit<PopoverMenuItem, 'icon' | 'iconType'>> = {},
    ): PopoverMenuItem => {
        const error = Object.values(errors ?? {}).at(0) ?? '';
        return {
            text: formatPhoneNumber(personalDetails?.displayName ?? personalDetails?.login ?? ''),
            description: Str.removeSMSDomain(personalDetails?.login ?? ''),
            avatarID: personalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            icon: personalDetails?.avatar ?? '',
            iconType: CONST.ICON_TYPE_AVATAR,
            outerWrapperStyle: shouldUseNarrowLayout ? {} : styles.accountSwitcherPopover,
            shouldIgnoreCompactStyle: true,
            numberOfLinesDescription: 1,
            errorText: error ?? '',
            shouldShowRedDotIndicator: !!error,
            errorTextStyle: styles.mt2,
            ...additionalProps,
        };
    };

    const currentUserMenuItem = createBaseMenuItem(currentUserPersonalDetails, undefined, {isSelected: true});
    const delegatorMenuItems: PopoverMenuItem[] = sortAlphabetically(
        delegators
            .filter(({email}) => email !== currentUserPersonalDetails.login)
            .map(({email, role}) => {
                const errorFields = account?.delegatedAccess?.errorFields ?? {};
                const error = getLatestError(errorFields?.connect?.[email]);
                const personalDetails = personalDetailsByLogin[email];
                return createBaseMenuItem(personalDetails, error, {
                    badgeText: translate('delegate.role', role),
                    onSelected: () => {
                        if (isOffline) {
                            close(showOfflineModal);
                            return;
                        }
                        if (isTrackingGPS) {
                            close(() => showGpsInProgressModal(() => connect({email, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID})));
                            return;
                        }
                        connect({email, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID});
                    },
                });
            }),
        'text',
        localeCompare,
    );
    const allMenuItems = [currentUserMenuItem, ...delegatorMenuItems];
    const [searchInput, setSearchInput, filteredMenuItems] = useSearchResults(allMenuItems, filterMenuItem);
    const shouldShowSearchInput = !isActingAsDelegate && delegatorMenuItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const menuItems = (): PopoverMenuItem[] => {
        if (isActingAsDelegate) {
            // Avoid duplicating the current user in the list when switching accounts
            if (delegate === currentUserPersonalDetails.login) {
                return [currentUserMenuItem];
            }

            const error = getLatestError(account?.delegatedAccess?.errorFields?.disconnect);

            return [
                createBaseMenuItem(personalDetailsByLogin[delegate], error, {
                    onSelected: () => {
                        if (isOffline) {
                            close(showOfflineModal);
                            return;
                        }

                        if (isTrackingGPS) {
                            close(() => showGpsInProgressModal(() => disconnect({stashedCredentials, stashedSession})));
                            return;
                        }

                        disconnect({stashedCredentials, stashedSession});
                    },
                }),
                currentUserMenuItem,
            ];
        }

        return shouldShowSearchInput ? filteredMenuItems : allMenuItems;
    };

    const hideDelegatorMenu = () => {
        setShouldShowDelegatorMenu(false);
        setSearchInput('');
        clearDelegatorErrors({delegatedAccess: account?.delegatedAccess});
    };

    return (
        <>
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flexGrow1, styles.flex1, styles.mnw0]}>
                <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flex1, styles.flexShrink1, styles.mnw0, styles.justifyContentCenter]}>
                    <UserAvatar
                        size={CONST.AVATAR_SIZE.DEFAULT}
                        accountID={currentUserPersonalDetails.accountID}
                        source={currentUserPersonalDetails.avatar}
                        fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    />
                    <View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter, styles.gap1]}>
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
                        <Text
                            numberOfLines={1}
                            style={[styles.colorMuted, styles.fontSizeLabel]}
                        >
                            {Str.removeSMSDomain(currentUserPersonalDetails.login ?? '')}
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
                {!!canSwitchAccounts && (
                    <TooltipToRender {...tooltipProps}>
                        {/* View wrapper forwards the hover events Tooltip injects; Button doesn't pass them to its underlying pressable, so the tooltip wouldn't show without it */}
                        <View>
                            <Button
                                size={CONST.BUTTON_SIZE.SMALL}
                                ref={buttonRef}
                                onPress={onPressSwitcher}
                                sentryLabel={CONST.SENTRY_LABEL.ACCOUNT_SWITCHER.SHOW_ACCOUNTS}
                            >
                                <Button.Text>{translate('delegate.switch')}</Button.Text>
                                <Button.Icon src={icons.CaretUpDown} />
                            </Button>
                        </View>
                    </TooltipToRender>
                )}
            </View>

            {!!canSwitchAccounts && (
                <PopoverMenu
                    isVisible={shouldShowDelegatorMenu}
                    onClose={hideDelegatorMenu}
                    onItemSelected={hideDelegatorMenu}
                    anchorRef={buttonRef}
                    anchorPosition={popoverPosition ?? CONST.POPOVER_ACCOUNT_SWITCHER_POSITION}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    menuItems={menuItems()}
                    headerText={translate('delegate.switchAccount')}
                    searchInputLabel={shouldShowSearchInput ? translate('workspace.people.findMember') : undefined}
                    searchInputValue={searchInput}
                    onSearchInputChange={setSearchInput}
                    shouldShowSearchEmptyState={shouldShowSearchInput && filteredMenuItems.length === 0 && searchInput.length > 0}
                    searchInputContainerStyle={styles.mb2}
                    containerStyles={[{maxHeight: windowHeight / 2}, styles.mw100, shouldUseNarrowLayout ? {} : styles.accountSwitcherPopover]}
                    headerStyles={styles.pt0}
                    innerContainerStyle={styles.pb0}
                    scrollContainerStyle={shouldShowSearchInput ? styles.pt0 : undefined}
                    shouldUseScrollView
                    shouldAddScrollViewTopItemSpacing={!shouldShowSearchInput}
                    shouldUpdateFocusedIndex={false}
                    enableEdgeToEdgeBottomSafeAreaPadding
                    shouldShowRadioButton
                />
            )}
        </>
    );
}

export default AccountSwitcher;
