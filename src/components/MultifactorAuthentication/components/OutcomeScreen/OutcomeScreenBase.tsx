import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {useMultifactorAuthenticationActions} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationActionsContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

type OutcomeScreenBaseProps = {
    headerTitle: string;
    illustration: IllustrationName;
    iconWidth: number;
    iconHeight: number;
    title: string;
    subtitle?: string;
    customSubtitle?: React.ReactElement;
    padding?: ViewStyle;
    /**
     * Override the back/confirm button handler. Defaults to dispatching CLOSE_MODAL,
     * which is correct when the screen is hosted inside the MFA modal navigator.
     *
     * Hosts that render the outcome inline inside the RHP (outside the MFA navigator)
     * must supply their own dismiss callback (e.g. `Navigation.closeRHPFlow()`).
     *
     * Examples in this repo:
     * - `src/pages/iou/AuthorizeTransactionPage.tsx` — deny outcome rendered inside RHP.
     * - `src/pages/settings/Wallet/ExpensifyCardPage/ChangePINAtATMPage.tsx` — standalone RHP screen.
     */
    onClose?: () => void;
    titleStyle?: StyleProp<TextStyle>;
};

function HTMLSubtitle({htmlString = '', style}: {htmlString?: string; style?: ViewStyle}) {
    const styles = useThemeStyles();

    // RenderHTML expands vertically beyond its content height. We render
    // invisible Text to establish natural height, then overlay RenderHTML
    // absolutely positioned to support HTML features (links, formatting).
    return (
        <View>
            <View style={[styles.opacity0, style]}>
                <Text style={[styles.textAlignCenter]}>{Parser.htmlToText(htmlString)}</Text>
            </View>
            <View style={[styles.pAbsolute, style]}>
                <RenderHTML html={`<centered-text><muted-text>${htmlString}</muted-text></centered-text>`} />
            </View>
        </View>
    );
}

function OutcomeScreenBase({headerTitle, illustration, iconWidth, iconHeight, title, subtitle, customSubtitle, padding, onClose: onCloseOverride, titleStyle}: OutcomeScreenBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(illustration));
    const {dispatch} = useMultifactorAuthenticationActions();

    const onClose =
        onCloseOverride ??
        (() => {
            dispatch({type: 'CLOSE_MODAL'});
        });

    const CustomSubtitle = customSubtitle ?? (
        <HTMLSubtitle
            htmlString={subtitle}
            style={styles.ph5}
        />
    );

    return (
        <ScreenWrapper testID={OutcomeScreenBase.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onClose}
                shouldShowBackButton
            />
            <View style={[styles.flex1, styles.gap2]}>
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter]}>
                    <BlockingView
                        icon={icon}
                        contentFitImage="fill"
                        iconWidth={iconWidth}
                        iconHeight={iconHeight}
                        title={title}
                        titleStyles={[styles.mb2, titleStyle]}
                        CustomSubtitle={CustomSubtitle}
                        containerStyle={[styles.ph5, padding]}
                        testID={OutcomeScreenBase.displayName}
                    />
                </ScrollView>
                <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                    <Button
                        large
                        success
                        style={styles.flex1}
                        onPress={onClose}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

OutcomeScreenBase.displayName = 'OutcomeScreenBase';

export default OutcomeScreenBase;
