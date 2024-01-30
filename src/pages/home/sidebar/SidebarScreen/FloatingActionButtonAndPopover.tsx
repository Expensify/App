import type {ImageContentFit} from 'expo-image/src/Image.types';
import type {Ref} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy as PolicyType} from '@src/types/onyx';
import {useIsFocused} from "@react-navigation/native";
import useLocalize from "@hooks/useLocalize";
import useWindowDimensions from "@hooks/useWindowDimensions";

type FloatingActionButtonAndPopoverOnyxProps = {
    /** The list of policies the user has access to. */
    allPolicies: OnyxCollection<PolicyType>;

    /** Indicated whether the report data is loading */
    isLoading: OnyxEntry<boolean>;
}

type FloatingActionButtonAndPopoverProps = {
    /* Callback function when the menu is shown */
    onShowCreateMenu?: () => void;

    /* Callback function before the menu is hidden */
    onHideCreateMenu?: () => void;

    /** Forwarded ref to FloatingActionButtonAndPopover */
    innerRef?: Ref<unknown>;
} & FloatingActionButtonAndPopoverOnyxProps;

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover(props: FloatingActionButtonAndPopoverProps) {
    const styles = useThemeStyles();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const isAnonymousUser = Session.isAnonymousUser();
    const anchorRef = useRef(null);

    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();

    const prevIsFocused = usePrevious(isFocused);

    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     */
    const didScreenBecomeInactive = useCallback(
        () =>
            // When any other page is opened over LHN
            !isFocused && prevIsFocused,
        [isFocused, prevIsFocused],
    );

    /**
     * Method called when we click the floating action button
     */
    const showCreateMenu = useCallback(
        () => {
            if (!isFocused && isSmallScreenWidth) {
                return;
            }
            setIsCreateMenuActive(true);
            props.onShowCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocused, isSmallScreenWidth],
    );

    /**
     * Method called either when:
     * - Pressing the floating action button to open the CreateMenu modal
     * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    const hideCreateMenu = useCallback(
        () => {
            if (!isCreateMenuActive) {
                return;
            }
            setIsCreateMenuActive(false);
            props.onHideCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCreateMenuActive],
    );

    /**
     * Checks if user is anonymous. If true, shows the sign in modal, else,
     * executes the callback.
     */
    const interceptAnonymousUser = (callback: () => void) => {
        if (isAnonymousUser) {
            Session.signOutAndRedirectToSignIn();
        } else {
            callback();
        }
    };

    useEffect(() => {
        if (!didScreenBecomeInactive()) {
            return;
        }

        // Hide menu manually when other pages are opened using shortcut key
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);

    useImperativeHandle(props.innerRef, () => ({
        hideCreateMenu() {
            hideCreateMenu();
        },
    }));

    return (
        <View>
            <PopoverMenu
                onClose={hideCreateMenu}
                isVisible={isCreateMenuActive && (!isSmallScreenWidth || isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!isSmallScreenWidth}
                menuItems={[
                    {
                        icon: Expensicons.ChatBubble,
                        text: translate('sidebarScreen.fabNewChat'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW)),
                    },
                    {
                        icon: Expensicons.MoneyCircle,
                        text: translate('iou.requestMoney'),
                        onSelected: () =>
                            interceptAnonymousUser(() =>
                                Navigation.navigate(
                                    // When starting to create a money request from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                                    // for all of the routes in the creation flow.
                                    ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.TYPE.REQUEST, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID()),
                                ),
                            ),
                    },
                    {
                        icon: Expensicons.Send,
                        text: translate('iou.sendMoney'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.TYPE.SEND)),
                    },
                    ...[
                        {
                            icon: Expensicons.Task,
                            text: translate('newTaskPage.assignTask'),
                            onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                        },
                    ],
                    {
                        icon: Expensicons.Heart,
                        text: translate('sidebarScreen.saveTheWorld'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.TEACHERS_UNITE)),
                    },
                    ...(!props.isLoading && !Policy.hasActiveFreePolicy(props.allPolicies ?? [])
                        ? [
                              {
                                  displayInDefaultIconColor: true,
                                  contentFit: 'contain' as ImageContentFit,
                                  icon: Expensicons.NewWorkspace,
                                  iconWidth: 46,
                                  iconHeight: 40,
                                  text: translate('workspace.new.newWorkspace'),
                                  description: translate('workspace.new.getTheExpensifyCardAndMore'),
                                  onSelected: () => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()),
                              },
                          ]
                        : []),
                ]}
                withoutOverlay
                anchorRef={anchorRef}
            />
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={anchorRef}
                onPress={() => {
                    if (isCreateMenuActive) {
                        hideCreateMenu();
                    } else {
                        showCreateMenu();
                    }
                }}
            />
        </View>
    );
}

FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

const FloatingActionButtonAndPopoverWithRef = forwardRef<unknown, FloatingActionButtonAndPopoverProps>((props, ref) => (
    <FloatingActionButtonAndPopover
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props}
        innerRef={ref}
    />
));

export default withOnyx<FloatingActionButtonAndPopoverProps, FloatingActionButtonAndPopoverOnyxProps>({
    allPolicies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    isLoading: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(FloatingActionButtonAndPopoverWithRef);