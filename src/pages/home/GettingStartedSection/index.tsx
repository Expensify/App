import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import GettingStartedRow from './GettingStartedRow';
import useGettingStartedItems from './hooks/useGettingStartedItems';

function GettingStartedSection() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {shouldShowSection, items} = useGettingStartedItems();

    if (!shouldShowSection) {
        return null;
    }

    return (
        <WidgetContainer title={translate('homePage.gettingStartedSection.title')}>
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {items.map((item) => (
                    <GettingStartedRow
                        key={item.key}
                        item={item}
                    />
                ))}
            </View>
        </WidgetContainer>
    );
}

export default GettingStartedSection;
