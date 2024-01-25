/* eslint-disable rulesdir/onyx-props-must-have-default */
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import _ from 'underscore';
import LogoComponent from '@assets/images/expensify-wordmark.svg';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Timing from '@libs/actions/Timing';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import onyxSubscribe from '@libs/onyxSubscribe';
import Performance from '@libs/Performance';
import SidebarUtils from '@libs/SidebarUtils';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import safeAreaInsetPropTypes from '@pages/safeAreaInsetPropTypes';
import variables from '@styles/variables';
import * as App from '@userActions/App';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SignInOrAvatarWithOptionalStatus from './SignInOrAvatarWithOptionalStatus';

const basePropTypes = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: PropTypes.func.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: safeAreaInsetPropTypes.isRequired,
};

const propTypes = {
    ...basePropTypes,

    optionListItems: PropTypes.arrayOf(PropTypes.string).isRequired,

    isLoading: PropTypes.bool.isRequired,

    // eslint-disable-next-line react/require-default-props
    priorityMode: PropTypes.oneOf(_.values(CONST.PRIORITY_MODE)),

    isActiveReport: PropTypes.func.isRequired,
};

function SidebarLinks({onLinkClick, insets, optionListItems, isLoading, priorityMode = CONST.PRIORITY_MODE.DEFAULT, isActiveReport, isCreateMenuOpen}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const modal = useRef({});
    const {translate, updateLocale} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => {
        if (!isSmallScreenWidth) {
            return;
        }
        App.confirmReadyToOpenApp();
    }, [isSmallScreenWidth]);

    useEffect(() => {
        App.setSidebarLoaded();
        SidebarUtils.setIsSidebarLoadedReady();

        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                updateLocale();
            });
        });

        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (_.isNull(modalArg) || typeof modalArg !== 'object') {
                    return;
                }
                modal.current = modalArg;
            },
        });

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (modal.current.willAlertModalBecomeVisible) {
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );

        ReportActionContextMenu.hideContextMenu(false);

        return () => {
            SidebarUtils.resetIsSidebarLoadedReadyPromise();
            if (unsubscribeEscapeKey) {
                unsubscribeEscapeKey();
            }
            if (unsubscribeOnyxModal) {
                unsubscribeOnyxModal();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showSearchPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Search page when click Search icon quickly after clicking FAB icon
            return;
        }

        // Capture metric for opening the search page
        Timing.start(CONST.TIMING.OPEN_SEARCH);
        Performance.markStart(CONST.TIMING.OPEN_SEARCH);

        Navigation.navigate(ROUTES.SEARCH);
    }, [isCreateMenuOpen]);

    /**
     * Show Report page with selected report id
     *
     * @param {Object} option
     * @param {String} option.reportID
     */
    const showReportPage = useCallback(
        (option) => {
            // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
            // or when clicking the active LHN row on large screens
            // or when continuously clicking different LHNs, only apply to small screen
            // since getTopmostReportId always returns on other devices
            const reportActionID = Navigation.getTopmostReportActionId();
            if (isCreateMenuOpen || (option.reportID === Navigation.getTopmostReportId() && !reportActionID) || (isSmallScreenWidth && isActiveReport(option.reportID) && !reportActionID)) {
                return;
            }
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
            onLinkClick();
        },
        [isCreateMenuOpen, isSmallScreenWidth, isActiveReport, onLinkClick],
    );

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View
                style={[styles.flexRow, styles.ph5, styles.pv3, styles.justifyContentBetween, styles.alignItemsCenter]}
                dataSet={{dragArea: true}}
            >
                <Header
                    title={
                        <ImageSVG
                            src={LogoComponent}
                            width={variables.lhnLogoWidth}
                            height={variables.lhnLogoHeight}
                            fill={theme.text}
                            contentFit="contain"
                        />
                    }
                    role={CONST.ROLE.PRESENTATION}
                    shouldShowEnvironmentBadge
                />
                <Tooltip text={translate('common.search')}>
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('sidebarScreen.buttonSearch')}
                        role={CONST.ROLE.BUTTON}
                        style={[styles.flexRow, styles.ph5]}
                        onPress={Session.checkIfActionIsAllowed(showSearchPage)}
                    >
                        <Icon
                            fill={theme.icon}
                            src={Expensicons.MagnifyingGlass}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
                <SignInOrAvatarWithOptionalStatus isCreateMenuOpen={isCreateMenuOpen} />
            </View>
            <View style={[styles.pRelative, styles.flex1]}>
                <LHNOptionsList
                    style={styles.flex1}
                    contentContainerStyles={StyleSheet.flatten([styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}])}
                    data={optionListItems}
                    onSelectRow={showReportPage}
                    shouldDisableFocusOptions={isSmallScreenWidth}
                    optionMode={viewMode}
                />
                {isLoading && optionListItems.length === 0 && (
                    <View style={[StyleSheet.absoluteFillObject, styles.highlightBG]}>
                        <OptionsListSkeletonView shouldAnimate />
                    </View>
                )}
            </View>
        </View>
    );
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.displayName = 'SidebarLinks';

export default SidebarLinks;
export {basePropTypes};
