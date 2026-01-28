import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';

/**
 * This is an empty placeholder component for the Discover section.
 * The actual implementation will be added in upcoming PRs.
 */
function DiscoverSection() {
    const {translate} = useLocalize();

    return (
        <WidgetContainer title={translate('homePage.discover')}>
            <View style={{height: 400}} />
        </WidgetContainer>
    );
}

export default DiscoverSection;
