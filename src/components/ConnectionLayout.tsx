import isEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {AccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {TranslationPaths} from '@src/languages/types';
import type {ConnectionName, PolicyFeatureName} from '@src/types/onyx/Policy';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';
import Text from './Text';

type ConnectionLayoutProps = {
    /** Used to set the testID for tests */
    displayName: string;

    /** Header title to be translated for the connection component */
    headerTitle?: TranslationPaths;

    /** The subtitle to show in the header */
    headerSubtitle?: string;

    /** React nodes that will be shown */
    children?: React.ReactNode;

    /** Title to be translated for the connection component */
    title?: TranslationPaths;

    /** The current policyID */
    policyID: string;

    /** Defines which types of access should be verified */
    accessVariants?: AccessVariant[];

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;

    /** The content container style of Scrollview */
    contentContainerStyle?: StyleProp<ViewStyle> | undefined;

    /** Style of the title text */
    titleStyle?: StyleProp<TextStyle> | undefined;

    /** Whether to include safe area padding bottom or not */
    shouldIncludeSafeAreaPaddingBottom?: boolean;

    /** Whether to use ScrollView or not */
    shouldUseScrollView?: boolean;

    /** Used for dynamic header title translation with parameters */
    headerTitleAlreadyTranslated?: string;

    /** Used for dynamic title translation with parameters */
    titleAlreadyTranslated?: string;

    /** Name of the current connection */
    connectionName: ConnectionName;

    /** Whether the screen should load for an empty connection */
    shouldLoadForEmptyConnection?: boolean;

    /** Handler for back button press */
    onBackButtonPress?: () => void;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;
};

type ConnectionLayoutContentProps = Pick<ConnectionLayoutProps, 'title' | 'titleStyle' | 'children' | 'titleAlreadyTranslated'>;

function ConnectionLayoutContent({title, titleStyle, children, titleAlreadyTranslated}: ConnectionLayoutContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <>
            {title && <Text style={[styles.pb5, titleStyle]}>{titleAlreadyTranslated ?? translate(title)}</Text>}
            {children}
        </>
    );
}

function ConnectionLayout({
    displayName,
    headerTitle,
    children,
    title,
    headerSubtitle,
    policyID,
    accessVariants,
    featureName,
    contentContainerStyle,
    titleStyle,
    shouldIncludeSafeAreaPaddingBottom,
    connectionName,
    shouldUseScrollView = true,
    headerTitleAlreadyTranslated,
    titleAlreadyTranslated,
    shouldLoadForEmptyConnection = false,
    onBackButtonPress = () => Navigation.goBack(),
    shouldBeBlocked = false,
}: ConnectionLayoutProps) {
    const {translate} = useLocalize();

    const policy = PolicyUtils.getPolicy(policyID);
    const isConnectionEmpty = isEmpty(policy?.connections?.[connectionName]);

    const renderSelectionContent = useMemo(
        () => (
            <ConnectionLayoutContent
                title={title}
                titleStyle={titleStyle}
                titleAlreadyTranslated={titleAlreadyTranslated}
            >
                {children}
            </ConnectionLayoutContent>
        ),
        [title, titleStyle, children, titleAlreadyTranslated],
    );

    const shouldBlockByConnection = shouldLoadForEmptyConnection ? !isConnectionEmpty : isConnectionEmpty;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
            shouldBeBlocked={!!shouldBeBlocked || shouldBlockByConnection}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={!!shouldIncludeSafeAreaPaddingBottom}
                shouldEnableMaxHeight
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={headerTitleAlreadyTranslated ?? (headerTitle ? translate(headerTitle) : '')}
                    subtitle={headerSubtitle}
                    onBackButtonPress={onBackButtonPress}
                />
                {shouldUseScrollView ? (
                    <ScrollView contentContainerStyle={contentContainerStyle}>{renderSelectionContent}</ScrollView>
                ) : (
                    <View style={contentContainerStyle}>{renderSelectionContent}</View>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ConnectionLayout.displayName = 'ConnectionLayout';
export default ConnectionLayout;
