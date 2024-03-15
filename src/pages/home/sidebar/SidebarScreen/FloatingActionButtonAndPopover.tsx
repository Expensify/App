import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import type {PolicySelector} from '@pages/home/sidebar/SidebarLinksData';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type FloatingActionButtonAndPopoverOnyxProps = {
    /** The list of policies the user has access to. */
    allPolicies: OnyxCollection<PolicySelector>;

    /** Whether app is in loading state */
    isLoading: OnyxEntry<boolean>;
};

type FloatingActionButtonAndPopoverProps = FloatingActionButtonAndPopoverOnyxProps & {
    /* Callback function when the menu is shown */
    onShowCreateMenu?: () => void;

    /* Callback function before the menu is hidden */
    onHideCreateMenu?: () => void;
};

type FloatingActionButtonAndPopoverRef = {
    hideCreateMenu: () => void;
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover(
    {onHideCreateMenu, onShowCreateMenu, isLoading, allPolicies}: FloatingActionButtonAndPopoverProps,
    ref: ForwardedRef<FloatingActionButtonAndPopoverRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const isFocused = useIsFocused();
    const {canUseTrackExpense} = usePermissions();

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
            onShowCreateMenu?.();
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
            onHideCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCreateMenuActive],
    );

    useEffect(() => {
        if (!didScreenBecomeInactive()) {
            return;
        }

        // Hide menu manually when other pages are opened using shortcut key
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);

    useImperativeHandle(ref, () => ({
        hideCreateMenu() {
            hideCreateMenu();
        },
    }));

    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
            showCreateMenu();
        }
    };

    return (
        <View style={styles.flexGrow1}>
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
                                IOU.startMoneyRequest_temporaryForRefactor(
                                    CONST.IOU.TYPE.REQUEST,
                                    // When starting to create a money request from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                                    // for all of the routes in the creation flow.
                                    ReportUtils.generateReportID(),
                                ),
                            ),
                    },
                    {
                        icon: Expensicons.Send,
                        text: translate('iou.sendMoney'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.TYPE.SEND)),
                    },
                    ...(canUseTrackExpense
                        ? [
                              {
                                  icon: Expensicons.TrackExpense,
                                  text: translate('iou.trackExpense'),
                                  onSelected: () =>
                                      interceptAnonymousUser(() =>
                                          IOU.startMoneyRequest_temporaryForRefactor(
                                              CONST.IOU.TYPE.TRACK_EXPENSE,
                                              // When starting to create a track expense from the global FAB, we need to retrieve selfDM reportID.
                                              // If it doesn't exist, we generate a random optimistic reportID and use it for all of the routes in the creation flow.
                                              ReportUtils.findSelfDMReportID() ?? ReportUtils.generateReportID(),
                                          ),
                                      ),
                              },
                          ]
                        : []),
                    {
                        icon: Expensicons.Task,
                        text: translate('newTaskPage.assignTask'),
                        onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                    },
                    {
                        icon: Expensicons.Heart,
                        text: translate('sidebarScreen.saveTheWorld'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.TEACHERS_UNITE)),
                    },
                    ...(!isLoading && !Policy.hasActiveFreePolicy(allPolicies as OnyxEntry<Record<string, OnyxTypes.Policy>>)
                        ? [
                              {
                                  displayInDefaultIconColor: true,
                                  contentFit: 'contain' as const,
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
                anchorRef={fabRef}
            />
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={fabRef}
                onPress={toggleCreateMenu}
            />
        </View>
    );
}

FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>) =>
    policy
        ? {
              type: policy.type,
              role: policy.role,
              isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
              pendingAction: policy.pendingAction,
          }
        : null;

export default withOnyx<FloatingActionButtonAndPopoverProps & RefAttributes<FloatingActionButtonAndPopoverRef>, FloatingActionButtonAndPopoverOnyxProps>({
    allPolicies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        // This assertion is needed because the selector in withOnyx expects that the return type will be the same as type in ONYXKEYS but for collection keys the selector is executed for each collection item. This is a bug in withOnyx typings that we don't have a solution yet, when useOnyx hook is introduced it will be fixed.
        selector: policySelector as unknown as (policy: OnyxEntry<OnyxTypes.Policy>) => OnyxCollection<PolicySelector>,
    },
    isLoading: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(forwardRef(FloatingActionButtonAndPopover));
