/* eslint-disable rulesdir/onyx-props-must-have-default */
import React from 'react';
import {View, InteractionManager} from 'react-native';
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
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import withWindowDimensions from '../../../components/withWindowDimensions';
import LHNOptionsList from '../../../components/LHNOptionsList/LHNOptionsList';
import SidebarUtils from '../../../libs/SidebarUtils';
import Header from '../../../components/Header';
import defaultTheme from '../../../styles/themes/default';
import OptionsListSkeletonView from '../../../components/OptionsListSkeletonView';
import variables from '../../../styles/variables';
import LogoComponent from '../../../../assets/images/expensify-wordmark.svg';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import * as Session from '../../../libs/actions/Session';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import onyxSubscribe from '../../../libs/onyxSubscribe';
import * as ReportActionContextMenu from '../report/ContextMenu/ReportActionContextMenu';
import SignInOrAvatarWithOptionalStatus from './SignInOrAvatarWithOptionalStatus';

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

    priorityMode: PropTypes.oneOf(_.values(CONST.PRIORITY_MODE)),

    isActiveReport: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};

class SidebarLinks extends React.PureComponent {
    constructor(props) {
        super(props);

        this.showSearchPage = this.showSearchPage.bind(this);
        this.showReportPage = this.showReportPage.bind(this);

        if (this.props.isSmallScreenWidth) {
            App.confirmReadyToOpenApp();
        }
    }

    componentDidMount() {
        App.setSidebarLoaded();
        SidebarUtils.setIsSidebarLoadedReady();
        this.isSidebarLoaded = true;

        // Eagerly set the locale on date-fns, it helps navigating to the report screen faster
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                this.props.updateLocale();
            });
        });

        let modal = {};
        this.unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                modal = modalArg;
            },
        });

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        this.unsubscribeEscapeKey = KeyboardShortcut.subscribe(
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

        ReportActionContextMenu.hideContextMenu(false);
    }

    componentWillUnmount() {
        SidebarUtils.resetIsSidebarLoadedReadyPromise();
        if (this.unsubscribeEscapeKey) {
            this.unsubscribeEscapeKey();
        }
        if (this.unsubscribeOnyxModal) {
            this.unsubscribeOnyxModal();
        }
    }

    showSearchPage() {
        if (this.props.isCreateMenuOpen) {
            // Prevent opening Search page when click Search icon quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SEARCH);
    }

    /**
     * Show Report page with selected report id
     *
     * @param {Object} option
     * @param {String} option.reportID
     */
    showReportPage(option) {
        // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
        // or when clicking the active LHN row on large screens
        // or when continuously clicking different LHNs, only apply to small screen
        // since getTopmostReportId always returns on other devices
        if (this.props.isCreateMenuOpen || option.reportID === Navigation.getTopmostReportId() || (this.props.isSmallScreenWidth && this.props.isActiveReport(option.reportID))) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
        this.props.onLinkClick();
    }

    render() {
        const viewMode = this.props.priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

        return (
            <View style={[styles.flex1, styles.h100]}>
                <View
                    style={[styles.flexRow, styles.ph5, styles.pv3, styles.justifyContentBetween, styles.alignItemsCenter]}
                    dataSet={{dragArea: true}}
                >
                    <Header
                        title={
                            <LogoComponent
                                fill={defaultTheme.text}
                                width={variables.lhnLogoWidth}
                                height={variables.lhnLogoHeight}
                            />
                        }
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        shouldShowEnvironmentBadge
                    />
                    <Tooltip text={this.props.translate('common.search')}>
                        <PressableWithoutFeedback
                            accessibilityLabel={this.props.translate('sidebarScreen.buttonSearch')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            style={[styles.flexRow, styles.ph5]}
                            onPress={Session.checkIfActionIsAllowed(this.showSearchPage)}
                        >
                            <Icon src={Expensicons.MagnifyingGlass} />
                        </PressableWithoutFeedback>
                    </Tooltip>
                    <SignInOrAvatarWithOptionalStatus isCreateMenuOpen={this.props.isCreateMenuOpen} />
                </View>

                <LHNOptionsList
                    style={[this.props.isLoading ? styles.flexShrink1 : styles.flex1]}
                    contentContainerStyles={[styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(this.props.insets).marginBottom}]}
                    data={this.props.optionListItems}
                    onSelectRow={this.showReportPage}
                    shouldDisableFocusOptions={this.props.isSmallScreenWidth}
                    optionMode={viewMode}
                />
                {this.props.isLoading && <OptionsListSkeletonView shouldAnimate />}
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;
export default compose(withLocalize, withWindowDimensions)(SidebarLinks);

export {basePropTypes};
