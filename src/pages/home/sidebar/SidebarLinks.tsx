import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
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
import type {OptionData} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import * as App from '@userActions/App';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Modal} from '@src/types/onyx';
import type PriorityMode from "@src/types/onyx/PriorityMode";
import SignInOrAvatarWithOptionalStatus from './SignInOrAvatarWithOptionalStatus';

type SidebarLinksOnyxProps = {
    isLoading: OnyxEntry<boolean>;

    priorityMode: OnyxEntry<PriorityMode>;
}

type SidebarLinksProps = {
    onLinkClick: () => void;

    /** Safe area insets required for mobile devices margins */
    insets?: EdgeInsets;

    isCreateMenuOpen?: boolean;

    optionListItems: OnyxEntry<string[]>;

    isActiveReport: (reportID: string) => boolean;
} & SidebarLinksOnyxProps;

function SidebarLinks({onLinkClick, insets, optionListItems, isLoading, priorityMode = CONST.PRIORITY_MODE.DEFAULT, isActiveReport, isCreateMenuOpen}: SidebarLinksProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const modal = useRef<Modal>({});
    const {translate, updateLocale} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => {
        if (!isSmallScreenWidth) {
            return;
        }
        App.confirmReadyToOpenApp();
    }, [isSmallScreenWidth]);

    useEffect(() => {
        SidebarUtils.setIsSidebarLoadedReady();

        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                updateLocale();
            });
        });

        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (modalArg === null || typeof modalArg !== 'object') {
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
     */
    const showReportPage = useCallback(
        (option: OptionData) => {
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
                    data={optionListItems ?? []}
                    onSelectRow={showReportPage}
                    shouldDisableFocusOptions={isSmallScreenWidth}
                    optionMode={viewMode}
                    onFirstItemRendered={App.setSidebarLoaded}
                />
                {isLoading && optionListItems?.length === 0 && (
                    <View style={[StyleSheet.absoluteFillObject, styles.highlightBG]}>
                        <OptionsListSkeletonView shouldAnimate />
                    </View>
                )}
            </View>
        </View>
    );
}

SidebarLinks.displayName = 'SidebarLinks';

export default SidebarLinks;
