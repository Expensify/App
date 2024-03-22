import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function ExpensifyClassicModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const theme = useTheme();

    const navigateBack = () => {
        Navigation.goBack(ROUTES.ONBOARD_MANAGE_EXPENSES);
    };

    const navigateToOldDot = () => {
        Link.openOldDotLink(`${CONST.OLDDOT_URLS.INBOX}${CONST.OLDDOT_URLS.DISMMISSED_REASON}`);
    };

    return (
        <HeaderPageLayout
            title="Expensify Classic"
            onBackButtonPress={navigateBack}
            backgroundColor={theme.PAGE_THEMES[SCREENS.ONBOARD_ENGAGEMENT.EXPENSIFY_CLASSIC].backgroundColor}
            testID={ExpensifyClassicModal.displayName}
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentCenter]}
            headerContent={
                <Icon
                    src={Expensicons.OldDotWireframe}
                    width={variables.oldDotWireframeIconWidth}
                    height={variables.oldDotWireframeIconHeight}
                />
            }
            footer={
                <Button
                    success
                    pressOnEnter
                    medium={isExtraSmallScreenHeight}
                    large={!isExtraSmallScreenHeight}
                    style={[styles.w100, styles.mtAuto]}
                    text={translate('expensifyClassic.buttonText')}
                    onPress={navigateToOldDot}
                />
            }
        >
            <View style={styles.ph5}>
                <Text
                    style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                    numberOfLines={2}
                >
                    {translate('expensifyClassic.title')}
                </Text>
                <Text style={[styles.mb4]}>{translate('expensifyClassic.firstDescription')}</Text>
                <Text>{translate('expensifyClassic.secondDescription')}</Text>
            </View>
        </HeaderPageLayout>
    );
}

ExpensifyClassicModal.displayName = 'ExpensifyClassicModal';

export default ExpensifyClassicModal;
