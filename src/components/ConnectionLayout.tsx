import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PolicyAccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {TranslationPaths} from '@src/languages/types';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';
import Text from './Text';

type ConnectionLayoutProps = {
    /** Used to set the testID for tests */
    displayName: string;

    /** Header title for the connection */
    headerTitle: TranslationPaths;

    /** React nodes that will be shown */
    children?: React.ReactNode;

    /** Title of the connection component */
    title?: TranslationPaths;

    /** Subtitle of the connection */
    subtitle?: TranslationPaths;

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
    
    /** Style of the subtitle text */
    subTitleStyle?: StyleProp<TextStyle> | undefined;
};

function ConnectionLayout({
    displayName,
    headerTitle,
    children,
    title,
    subtitle,
    policyID,
    accessVariants,
    featureName,
    contentContainerStyle,
    titleStyle,
    subTitleStyle,
}: ConnectionLayoutProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={translate(headerTitle)}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={contentContainerStyle}>
                    {title && <Text style={[styles.pb5, titleStyle]}>{translate(title)}</Text>}
                    {subtitle && <Text style={[styles.textLabelSupporting, subTitleStyle]}>{translate(subtitle)}</Text>}
                    {children}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ConnectionLayout.displayName = 'ConnectionLayout';
export default ConnectionLayout;
