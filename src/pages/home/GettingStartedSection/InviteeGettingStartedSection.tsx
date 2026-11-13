import WidgetContainer from '@components/WidgetContainer';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import DefaultGettingStartedSection from './DefaultGettingStartedSection';
import GettingStartedRow from './GettingStartedRow';
import useInviteeGettingStartedItems from './hooks/useInviteeGettingStartedItems';

/**
 * The Getting started list for a member who signed up through a workspace invite. It has no help footer, because the
 * footer opens the workspace admins room, which members cannot open.
 */
function InviteeGettingStartedSection() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isMemberWithoutAdminRole, shouldShowSection, addNameItem, addFirstReceiptItem, downloadAppItem} = useInviteeGettingStartedItems();

    if (!isMemberWithoutAdminRole) {
        return <DefaultGettingStartedSection />;
    }

    if (!shouldShowSection) {
        return null;
    }

    return (
        <WidgetContainer title={translate('homePage.gettingStartedSection.title')}>
            <View style={[styles.getWidgetRowGroupStyle(shouldUseNarrowLayout), styles.mb2]}>
                <GettingStartedRow item={addNameItem} />
                <GettingStartedRow item={addFirstReceiptItem} />
                <GettingStartedRow item={downloadAppItem} />
            </View>
        </WidgetContainer>
    );
}

export default InviteeGettingStartedSection;
