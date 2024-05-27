import {isEmpty} from 'lodash';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {PolicyAccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
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

    /** Header title for the connection */
    headerTitle: TranslationPaths;

    /** The subtitle to show in the header */
    headerSubtitle?: string;

    /** React nodes that will be shown */
    children?: React.ReactNode;

    /** Title of the connection component */
    title?: TranslationPaths;

    /** The current policyID */
    policyID: string;

    /** Defines which types of access should be verified */
    accessVariants?: PolicyAccessVariant[];

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

    /** Name of the current connection */
    connectionName: ConnectionName;
};

type ConnectionLayoutContentProps = Pick<ConnectionLayoutProps, 'title' | 'titleStyle' | 'children'>;

function ConnectionLayoutContent({title, titleStyle, children}: ConnectionLayoutContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <>
            {title && <Text style={[styles.pb5, titleStyle]}>{translate(title)}</Text>}
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
}: ConnectionLayoutProps) {
    const {translate} = useLocalize();

    const policy = PolicyUtils.getPolicy(policyID ?? '');
    const isConnectionEmpty = isEmpty(policy.connections?.[connectionName]);

    const renderSelectionContent = useMemo(
        () => (
            <ConnectionLayoutContent
                title={title}
                titleStyle={titleStyle}
            >
                {children}
            </ConnectionLayoutContent>
        ),
        [title, titleStyle, children],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
            shouldBeBlocked={isConnectionEmpty}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={!!shouldIncludeSafeAreaPaddingBottom}
                shouldEnableMaxHeight
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={translate(headerTitle)}
                    subtitle={headerSubtitle}
                    onBackButtonPress={() => Navigation.goBack()}
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
