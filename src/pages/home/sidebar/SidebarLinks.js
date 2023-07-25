/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React, {useEffect, useCallback} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import safeAreaInsetPropTypes from '../../safeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import withWindowDimensions from '../../../components/withWindowDimensions';
import LHNOptionsList from '../../../components/LHNOptionsList/LHNOptionsList';
import SidebarUtils from '../../../libs/SidebarUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import Header from '../../../components/Header';
import defaultTheme from '../../../styles/themes/default';
import OptionsListSkeletonView from '../../../components/OptionsListSkeletonView';
import variables from '../../../styles/variables';
import LogoComponent from '../../../../assets/images/expensify-wordmark.svg';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import * as Session from '../../../libs/actions/Session';
import Button from '../../../components/Button';
import * as UserUtils from '../../../libs/UserUtils';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import onyxSubscribe from '../../../libs/onyxSubscribe';
import personalDetailsPropType from '../../personalDetailsPropType';

const basePropTypes = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: PropTypes.func.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: safeAreaInsetPropTypes.isRequired,

    /** Whether we are viewing below the responsive breakpoint */
    isSmallScreenWidth: PropTypes.bool.isRequired,
};

const propTypes = {
    ...basePropTypes,

    optionListItems: PropTypes.arrayOf(PropTypes.string).isRequired,

    isLoading: PropTypes.bool.isRequired,

    currentUserPersonalDetails: personalDetailsPropType,

    priorityMode: PropTypes.oneOf(_.values(CONST.PRIORITY_MODE)),

    ...withLocalizePropTypes,
};

const defaultProps = {
    currentUserPersonalDetails: {
        avatar: '',
    },
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};
function SidebarLinks(props) {
    if (props.isSmallScreenWidth) {
        App.confirmReadyToOpenApp();
    }

    useEffect(() => {
        App.setSidebarLoaded();
        SidebarUtils.setIsSidebarLoadedReady();

        let modal = {};
        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                modal = modalArg;
            },
        });

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (modal.willAlertModalBecomeVisible) {
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );
        return () => {
            SidebarUtils.resetIsSidebarLoadedReadyPromise();
            if (unsubscribeEscapeKey) {
                unsubscribeEscapeKey();
            }
            if (unsubscribeOnyxModal) {
                unsubscribeOnyxModal();
            }
        };
    }, []);

    function showSearchPage() {
        if (props.isCreateMenuOpen) {
            // Prevent opening Search page when click Search icon quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SEARCH);
    }

    function showSettingsPage() {
        if (props.isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Show Report page with selected report id
     *
     * @param {Object} option
     * @param {String} option.reportID
     */
    const showReportPage = useCallback(
        (option) => {
            // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
            // or when clicking the active LHN row
            // or when continuously clicking different LHNs, only apply to small screen
            // since getTopmostReportId always returns on other devices
            if (props.isCreateMenuOpen || props.currentReportID === option.reportID || (props.isSmallScreenWidth && Navigation.getTopmostReportId())) {
                return;
            }
            Navigation.navigate(ROUTES.getReportRoute(option.reportID));
            props.onLinkClick();
        },
        [props],
    );

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View
                style={[styles.flexRow, styles.ph5, styles.pv3, styles.justifyContentBetween, styles.alignItemsCenter]}
                nativeID="drag-area"
            >
                <Header
                    title={
                        <LogoComponent
                            fill={defaultTheme.textLight}
                            width={variables.lhnLogoWidth}
                            height={variables.lhnLogoHeight}
                        />
                    }
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    shouldShowEnvironmentBadge
                />
                <Tooltip text={props.translate('common.search')}>
                    <PressableWithoutFeedback
                        accessibilityLabel={props.translate('sidebarScreen.buttonSearch')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        style={[styles.flexRow, styles.ph5]}
                        onPress={Session.checkIfActionIsAllowed(showSearchPage)}
                    >
                        <Icon src={Expensicons.MagnifyingGlass} />
                    </PressableWithoutFeedback>
                </Tooltip>
                <PressableWithoutFeedback
                    accessibilityLabel={props.translate('sidebarScreen.buttonMySettings')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    onPress={Session.checkIfActionIsAllowed(showSettingsPage)}
                >
                    {Session.isAnonymousUser() ? (
                        <View style={styles.signInButtonAvatar}>
                            <Button
                                medium
                                success
                                text={props.translate('common.signIn')}
                                onPress={() => Session.signOutAndRedirectToSignIn()}
                            />
                        </View>
                    ) : (
                        <OfflineWithFeedback pendingAction={lodashGet(props.currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                            <AvatarWithIndicator
                                source={UserUtils.getAvatar(props.currentUserPersonalDetails.avatar, props.currentUserPersonalDetails.accountID)}
                                tooltipText={props.translate('common.settings')}
                            />
                        </OfflineWithFeedback>
                    )}
                </PressableWithoutFeedback>
            </View>
            {props.isLoading ? (
                <OptionsListSkeletonView shouldAnimate />
            ) : (
                <LHNOptionsList
                    contentContainerStyles={[styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(props.insets).marginBottom}]}
                    data={props.optionListItems}
                    onSelectRow={showReportPage}
                    shouldDisableFocusOptions={props.isSmallScreenWidth}
                    optionMode={props.priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT}
                />
            )}
        </View>
    );
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;
export default compose(withLocalize, withCurrentUserPersonalDetails, withWindowDimensions)(SidebarLinks);
export {basePropTypes};
