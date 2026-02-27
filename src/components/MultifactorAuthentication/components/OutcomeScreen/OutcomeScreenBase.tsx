import React from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

type OutcomeScreenBaseProps = {
    headerTitle: string;
    illustration: IllustrationName;
    iconWidth: number;
    iconHeight: number;
    title: string;
    subtitle?: string;
    customSubtitle?: React.ReactElement;
    padding?: ViewStyle;
};

function OutcomeScreenBase({headerTitle, illustration, iconWidth, iconHeight, title, subtitle, customSubtitle, padding}: OutcomeScreenBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(illustration));

    const onClose = () => {
        Navigation.closeRHPFlow();
    };

    return (
        <ScreenWrapper testID={OutcomeScreenBase.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onClose}
                shouldShowBackButton
            />
            <View style={styles.flex1}>
                <BlockingView
                    icon={icon}
                    contentFitImage="fill"
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={subtitle}
                    CustomSubtitle={customSubtitle}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={[styles.ph5, padding]}
                    testID={OutcomeScreenBase.displayName}
                />
            </View>
            <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                <Button
                    large
                    success
                    style={styles.flex1}
                    onPress={onClose}
                    text={translate('common.buttonConfirm')}
                />
            </View>
        </ScreenWrapper>
    );
}

OutcomeScreenBase.displayName = 'OutcomeScreenBase';

export default OutcomeScreenBase;
export type {OutcomeScreenBaseProps};
