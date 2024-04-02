/* eslint-disable rulesdir/onyx-props-must-have-default */
import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import _ from 'underscore';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import onyxSubscribe from '@libs/onyxSubscribe';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import safeAreaInsetPropTypes from '@pages/safeAreaInsetPropTypes';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const modal = useRef({});
    const {updateLocale} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => {
        App.confirmReadyToOpenApp();
    }, []);

    useEffect(() => {
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
            if (unsubscribeEscapeKey) {
                unsubscribeEscapeKey();
            }
            if (unsubscribeOnyxModal) {
                unsubscribeOnyxModal();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const contentContainerStyles = useMemo(() => StyleSheet.flatten([styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]), [insets]);

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View style={[styles.pRelative, styles.flex1]}>
                <LHNOptionsList
                    style={styles.flex1}
                    contentContainerStyles={contentContainerStyles}
                    data={optionListItems}
                    onSelectRow={showReportPage}
                    shouldDisableFocusOptions={isSmallScreenWidth}
                    optionMode={viewMode}
                    onFirstItemRendered={App.setSidebarLoaded}
                />
                {isLoading && optionListItems.length === 0 && (
                    <View style={[StyleSheet.absoluteFillObject, styles.appBG]}>
                        <OptionsListSkeletonView shouldAnimate />
                    </View>
                )}
            </View>
        </View>
    );
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.displayName = 'SidebarLinks';

export default memo(SidebarLinks);
export {basePropTypes};
