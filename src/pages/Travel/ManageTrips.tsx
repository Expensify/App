import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {InteractionManager, Linking, View} from 'react-native';
import BookTravelButton from '@components/BookTravelButton';
import Button from '@components/Button';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

const tripsFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Illustrations.Alert,
        translationKey: 'travel.features.alerts',
    },
];

function ManageTrips() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

    const navigateToBookTravelDemo = () => {
        Linking.openURL(CONST.BOOK_TRAVEL_DEMO_URL);
    };

    const scrollViewRef = useRef<RNScrollView>(null);

    const scrollToBottom = () => {
        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
        });
    };

    useEffect(() => {
        if (!shouldScrollToBottom) {
            return;
        }
        scrollToBottom();
        setShouldScrollToBottom(false);
    }, [shouldScrollToBottom]);

    return (
        <ScrollView
            contentContainerStyle={styles.pt3}
            ref={scrollViewRef}
        >
            <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList
                    menuItems={tripsFeatures}
                    title={translate('travel.title')}
                    subtitle={translate('travel.subtitle')}
                    illustration={LottieAnimations.TripsEmptyState}
                    illustrationStyle={[styles.mv4]}
                    illustrationBackgroundColor={colors.blue600}
                    titleStyles={styles.textHeadlineH1}
                    contentPaddingOnLargeScreens={styles.p5}
                    footer={
                        <>
                            <Button
                                text={translate('travel.bookDemo')}
                                onPress={navigateToBookTravelDemo}
                                accessibilityLabel={translate('travel.bookDemo')}
                                style={[styles.w100, styles.mb3]}
                                large
                            />
                            <BookTravelButton
                                text={translate('travel.bookTravel')}
                                shouldRenderErrorMessageBelowButton
                                setShouldScrollToBottom={setShouldScrollToBottom}
                            />
                        </>
                    }
                />
            </View>
        </ScrollView>
    );
}

ManageTrips.displayName = 'ManageTrips';

export default ManageTrips;
