import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import StatsCounter from '@libs/actions/StatsCounter';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import BlockingView from './BlockingView';
import ForceFullScreenView from './ForceFullScreenView';

type FullPageNotFoundViewProps = {
    /** TestID for test */
    testID?: string;

    /** Child elements */
    children?: React.ReactNode;

    /** If true, child components are replaced with a blocking "not found" view */
    shouldShow?: boolean;

    /** The key in the translations file to use for the title */
    titleKey?: TranslationPaths;

    /** The key in the translations file to use for the subtitle. Pass an empty key to not show the subtitle. */
    subtitleKey?: TranslationPaths | '';

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink?: boolean;

    /** Whether we should show the back button on the header */
    shouldShowBackButton?: boolean;

    /** The key in the translations file to use for the go back link */
    linkTranslationKey?: TranslationPaths;

    /** The key in the translations file to use for the subtitle */
    subtitleKeyBelowLink?: TranslationPaths | '';

    /** Method to trigger when pressing the back button of the header */
    onBackButtonPress?: () => void;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Whether we should force the full page view */
    shouldForceFullScreen?: boolean;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Whether we should display the button that opens new SearchRouter */
    shouldDisplaySearchRouter?: boolean;

    /** Whether to add bottom safe area padding to the view. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageNotFoundView({
    testID,
    children = null,
    shouldShow = false,
    titleKey = 'notFound.notHere',
    subtitleKey = 'notFound.pageNotFound',
    linkTranslationKey = 'notFound.goBackHome',
    subtitleKeyBelowLink,
    onBackButtonPress = () => Navigation.goBack(),
    shouldShowLink = true,
    shouldShowBackButton = true,
    onLinkPress = () => Navigation.goBackToHome(),
    shouldForceFullScreen = false,
    subtitleStyle,
    shouldDisplaySearchRouter,
    addBottomSafeAreaPadding = true,
    addOfflineIndicatorBottomSafeAreaPadding = addBottomSafeAreaPadding,
}: FullPageNotFoundViewProps) {
    const styles = useThemeStyles();
    const {isMediumScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);

    if (shouldShow) {
        StatsCounter('FullPageNotFoundView');
        return (
            <ForceFullScreenView shouldForceFullScreen={shouldForceFullScreen}>
                <HeaderWithBackButton
                    onBackButtonPress={onBackButtonPress}
                    shouldShowBackButton={shouldShowBackButton}
                    shouldDisplaySearchRouter={shouldDisplaySearchRouter && (isMediumScreenWidth || isLargeScreenWidth)}
                />
                <View
                    style={[styles.flex1, styles.blockingViewContainer]}
                    testID={testID}
                >
                    <BlockingView
                        icon={illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate(titleKey)}
                        subtitle={subtitleKey && translate(subtitleKey)}
                        linkTranslationKey={shouldShowLink ? linkTranslationKey : undefined}
                        subtitleKeyBelowLink={subtitleKeyBelowLink}
                        onLinkPress={onLinkPress}
                        subtitleStyle={subtitleStyle}
                        addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                        addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
                        testID="FullPageNotFoundView"
                    />
                </View>
            </ForceFullScreenView>
        );
    }

    return children;
}

export type {FullPageNotFoundViewProps};
export default FullPageNotFoundView;
