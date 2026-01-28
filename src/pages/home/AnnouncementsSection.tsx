import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';

/**
 * This is an empty placeholder component for the Announcements section.
 * The actual implementation will be added in upcoming PRs.
 */
function AnnouncementsSection() {
    const {translate} = useLocalize();

    return (
        <WidgetContainer title={translate('homePage.announcements')}>
            <View style={{height: 400}} />
        </WidgetContainer>
    );
}

export default AnnouncementsSection;
