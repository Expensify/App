import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import BlockingView from './BlockingView';
import ForceFullScreenView from './ForceFullScreenView';

type FullPageNotFoundViewProps = {
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
    linkKey?: TranslationPaths;

    /** Method to trigger when pressing the back button of the header */
    onBackButtonPress?: () => void;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Whether we should force the full page view */
    shouldForceFullScreen?: boolean;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageNotFoundView({
    children = null,
    shouldShow = false,
    titleKey = 'notFound.notHere',
    subtitleKey = 'notFound.pageNotFound',
    linkKey = 'notFound.goBackHome',
    onBackButtonPress = () => Navigation.goBack(),
    shouldShowLink = true,
    shouldShowBackButton = true,
    onLinkPress = () => Navigation.dismissModal(),
    shouldForceFullScreen = false,
}: FullPageNotFoundViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (shouldShow) {
        return (
            <ForceFullScreenView shouldForceFullScreen={shouldForceFullScreen}>
                <HeaderWithBackButton
                    onBackButtonPress={onBackButtonPress}
                    shouldShowBackButton={shouldShowBackButton}
                />
                <View style={[styles.flex1, styles.blockingViewContainer]}>
                    <BlockingView
                        icon={Illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate(titleKey)}
                        subtitle={subtitleKey && translate(subtitleKey)}
                        linkKey={linkKey}
                        shouldShowLink={shouldShowLink}
                        onLinkPress={onLinkPress}
                    />
                </View>
            </ForceFullScreenView>
        );
    }

    return children;
}

FullPageNotFoundView.displayName = 'FullPageNotFoundView';

export type {FullPageNotFoundViewProps};
export default FullPageNotFoundView;
