import React, {useRef} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type InitialSettingsPageViewProps from './types';

function InitialSettingsPageView({
    headerContent,
    scrollViewRef,
    onScroll,
    accountMenuItems,
    generalMenuItems,
    shouldShowSignoutConfirmModal,
    toggleSignoutConfirmModal,
    signOut,
}: InitialSettingsPageViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const shouldLogout = useRef(false);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="InitialSettingsPageView"
            bottomContent={!shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
            shouldEnableKeyboardAvoidingView={false}
        >
            {headerContent}
            <ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.w100]}
                showsVerticalScrollIndicator={false}
            >
                {accountMenuItems}
                {generalMenuItems}
                <ConfirmModal
                    danger
                    title={translate('common.areYouSure')}
                    prompt={translate('initialSettingsPage.signOutConfirmationText')}
                    confirmText={translate('initialSettingsPage.signOut')}
                    cancelText={translate('common.cancel')}
                    isVisible={shouldShowSignoutConfirmModal}
                    onConfirm={() => {
                        toggleSignoutConfirmModal(false);
                        shouldLogout.current = true;
                    }}
                    onCancel={() => toggleSignoutConfirmModal(false)}
                    onModalHide={() => {
                        if (!shouldLogout.current) {
                            return;
                        }
                        signOut(true);
                    }}
                />
            </ScrollView>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
        </ScreenWrapper>
    );
}

InitialSettingsPageView.displayName = 'InitialSettingsPageView';
export default InitialSettingsPageView;
