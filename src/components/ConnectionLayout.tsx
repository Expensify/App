import isEmpty from 'lodash/isEmpty';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {AccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
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
    policyID?: string;

    /** Defines which types of access should be verified */
    accessVariants?: AccessVariant[];

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;

    /** The content container style of ScrollView */
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
            {!!title && <Text style={[styles.pb5, titleStyle]}>{titleAlreadyTranslated ?? translate(title)}</Text>}
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

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const isConnectionEmpty = isEmpty(policy?.connections?.[connectionName]);

    const shouldBlockByConnection = shouldLoadForEmptyConnection ? !isConnectionEmpty : isConnectionEmpty;

    const selectionContent = (
        <ConnectionLayoutContent
            title={title}
            titleStyle={titleStyle}
            titleAlreadyTranslated={titleAlreadyTranslated}
        >
            {children}
        </ConnectionLayoutContent>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
            shouldBeBlocked={!!shouldBeBlocked && shouldBlockByConnection}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                includeSafeAreaPaddingBottom={!!shouldIncludeSafeAreaPaddingBottom}
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={headerTitleAlreadyTranslated ?? (headerTitle ? translate(headerTitle) : '')}
                    subtitle={headerSubtitle}
                    onBackButtonPress={onBackButtonPress}
                />
                {shouldUseScrollView ? (
                    <ScrollView
                        contentContainerStyle={contentContainerStyle}
                        addBottomSafeAreaPadding
                    >
                        {selectionContent}
                    </ScrollView>
                ) : (
                    <View style={contentContainerStyle}>{selectionContent}</View>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ConnectionLayout;
