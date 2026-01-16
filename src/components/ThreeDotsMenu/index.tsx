import React, {useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import type BaseModalProps from '@components/Modal/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile} from '@libs/Browser';
import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ThreeDotsMenuProps from './types';

function ThreeDotsMenu({
    iconTooltip = 'common.more',
    icon,
    iconFill,
    iconStyles,
    onIconPress = () => {},
    menuItems,
    anchorPosition,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    getAnchorPosition,
    shouldOverlay = false,
    shouldSetModalVisibility = true,
    disabled = false,
    hideProductTrainingTooltip,
    renderProductTrainingTooltipContent,
    shouldShowProductTrainingTooltip = false,
    isNested = false,
    shouldSelfPosition = false,
    threeDotsMenuRef,
    sentryLabel,
}: ThreeDotsMenuProps) {
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});

    const theme = useTheme();
    const styles = useThemeStyles();
    const [isPopupMenuVisible, setPopupMenuVisible] = useState(false);
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();
    const [position, setPosition] = useState<AnchorPosition>();
    const buttonRef = useRef<View>(null);
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ThreeDots']);
    const isBehindModal = modal?.willAlertModalBecomeVisible && !modal?.isPopover && !shouldOverlay;
    const {windowWidth, windowHeight} = useWindowDimensions();
    const showPopoverMenu = () => {
        setPopupMenuVisible(true);
    };

    const hidePopoverMenu = useCallback((selectedItem?: PopoverMenuItem) => {
        if (selectedItem && selectedItem.shouldKeepModalOpen) {
            return;
        }
        setPopupMenuVisible(false);
    }, []);

    const {calculatePopoverPosition} = usePopoverPosition();

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => calculatePopoverPosition(buttonRef, anchorAlignment), [anchorAlignment, calculatePopoverPosition]);

    const getMenuPosition = shouldSelfPosition ? calculateAndSetThreeDotsMenuPosition : getAnchorPosition;

    const onThreeDotsPress = () => {
        if (isPopupMenuVisible) {
            hidePopoverMenu();
            return;
        }
        hideProductTrainingTooltip?.();
        buttonRef.current?.blur();

        if (getMenuPosition) {
            getMenuPosition?.().then((value) => {
                setPosition(value);
                showPopoverMenu();
            });
        } else {
            showPopoverMenu();
        }

        onIconPress?.();
    };

    useImperativeHandle(threeDotsMenuRef as React.RefObject<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean; onThreeDotsPress: () => void}> | undefined, () => ({
        isPopupMenuVisible,
        hidePopoverMenu,
        onThreeDotsPress,
    }));

    useEffect(() => {
        if (!isBehindModal || !isPopupMenuVisible) {
            return;
        }
        hidePopoverMenu();
    }, [hidePopoverMenu, isBehindModal, isPopupMenuVisible]);

    useLayoutEffect(() => {
        if (!getMenuPosition || !isPopupMenuVisible) {
            return;
        }

        getMenuPosition?.().then((value) => {
            setPosition(value);
        });
    }, [windowWidth, windowHeight, shouldSelfPosition, getMenuPosition, isPopupMenuVisible]);

    const TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip : Tooltip;
    const tooltipProps = shouldShowProductTrainingTooltip
        ? {
              renderTooltipContent: renderProductTrainingTooltipContent,
              shouldRender: shouldShowProductTrainingTooltip,
              anchorAlignment: {
                  horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                  vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
              },
              shiftHorizontal: variables.savedSearchShiftHorizontal,
              shiftVertical: variables.savedSearchShiftVertical,
              wrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper],
              onTooltipPress: onThreeDotsPress,
          }
        : {text: translate(iconTooltip), shouldRender: true};

    return (
        <>
            <View>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <TooltipToRender {...tooltipProps}>
                    <PressableWithoutFeedback
                        onPress={onThreeDotsPress}
                        disabled={disabled}
                        onMouseDown={(e) => {
                            /* Keep the focus state on mWeb like we did on the native apps. */
                            if (!isMobile()) {
                                return;
                            }
                            e.preventDefault();
                        }}
                        ref={buttonRef}
                        style={[styles.touchableButtonImage, iconStyles]}
                        role={getButtonRole(isNested)}
                        isNested={isNested}
                        accessibilityLabel={translate(iconTooltip)}
                        sentryLabel={sentryLabel}
                    >
                        <Icon
                            src={icon ?? expensifyIcons.ThreeDots}
                            fill={(iconFill ?? isPopupMenuVisible) ? theme.success : theme.icon}
                        />
                    </PressableWithoutFeedback>
                </TooltipToRender>
            </View>
            <PopoverMenu
                onClose={hidePopoverMenu}
                onModalHide={() => setRestoreFocusType(undefined)}
                isVisible={isPopupMenuVisible && !isBehindModal}
                anchorPosition={position ?? anchorPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={anchorAlignment}
                onItemSelected={(item) => {
                    setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
                    hidePopoverMenu(item);
                }}
                menuItems={menuItems}
                withoutOverlay={!shouldOverlay}
                shouldSetModalVisibility={shouldSetModalVisibility}
                anchorRef={buttonRef}
                shouldEnableNewFocusManagement
                restoreFocusType={restoreFocusType}
            />
        </>
    );
}

export default ThreeDotsMenu;
