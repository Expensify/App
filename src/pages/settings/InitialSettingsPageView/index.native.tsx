import React, {useRef} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
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
    const shouldLogout = useRef(false);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="InitialSettingsPageView"
            shouldEnableKeyboardAvoidingView={false}
            style={styles.scrollPaddingWhenNoBottomTab}
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
        </ScreenWrapper>
    );
}

InitialSettingsPageView.displayName = 'InitialSettingsPageView';
export default InitialSettingsPageView;
