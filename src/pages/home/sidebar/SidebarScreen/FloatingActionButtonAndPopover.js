import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import withNavigation from '@components/withNavigation';
import withNavigationFocus from '@components/withNavigationFocus';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        role: policy.role,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
    };

const propTypes = {
    ...windowDimensionsPropTypes,

    /* Callback function when the menu is shown */
    onShowCreateMenu: PropTypes.func,

    /* Callback function before the menu is hidden */
    onHideCreateMenu: PropTypes.func,

    /** The list of policies the user has access to. */
    allPolicies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** Indicated whether the report data is loading */
    isLoading: PropTypes.bool,

    /** Forwarded ref to FloatingActionButtonAndPopover */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    isLoading: false,
    innerRef: null,
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 * @param {Object} props
 * @returns {JSX.Element}
 */
function FloatingActionButtonAndPopover(props) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef(null);

    const prevIsFocused = usePrevious(props.isFocused);

    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     *
     * @param {Object} prevProps
     * @return {Boolean}
     */
    const didScreenBecomeInactive = useCallback(
        () =>
            // When any other page is opened over LHN
            !props.isFocused && prevIsFocused,
        [props.isFocused, prevIsFocused],
    );

    /**
     * Method called when we click the floating action button
     */
    const showCreateMenu = useCallback(
        () => {
            if (!props.isFocused && shouldUseNarrowLayout) {
                return;
            }
            setIsCreateMenuActive(true);
            props.onShowCreateMenu();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.isFocused, shouldUseNarrowLayout],
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
            props.onHideCreateMenu();
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

    useImperativeHandle(props.innerRef, () => ({
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
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || props.isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(props.windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
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
                    ...(!props.isLoading && !Policy.hasActiveFreePolicy(props.allPolicies)
                        ? [
                              {
                                  displayInDefaultIconColor: true,
                                  contentFit: 'contain',
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

FloatingActionButtonAndPopover.propTypes = propTypes;
FloatingActionButtonAndPopover.defaultProps = defaultProps;
FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

const FloatingActionButtonAndPopoverWithRef = forwardRef((props, ref) => (
    <FloatingActionButtonAndPopover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

FloatingActionButtonAndPopoverWithRef.displayName = 'FloatingActionButtonAndPopoverWithRef';

export default compose(
    withNavigation,
    withNavigationFocus,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
        isLoading: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    }),
)(FloatingActionButtonAndPopoverWithRef);
