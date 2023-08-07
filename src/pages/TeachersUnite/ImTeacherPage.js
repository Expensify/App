import React from 'react';
import {View} from 'react-native';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import FixedFooter from '../../components/FixedFooter';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import * as Illustrations from '../../components/Icon/Illustrations';
import variables from '../../styles/variables';
import useLocalize from '../../hooks/useLocalize';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function ImTeacherPage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iAmATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <View style={[styles.teacherPageContainer]}>
                <Icon
                    src={Illustrations.EmailAddress}
                    width={variables.signInLogoWidthLargeScreen}
                    height={variables.lhnLogoWidth}
                />

                <Text style={[styles.notFoundTextHeader]}>{translate('teachersUnitePage.updateYourEmail')}</Text>
                <Text style={[styles.textAlignCenter]}>
                    <Text style={[styles.textAlignCenter]}>{translate('teachersUnitePage.schoolMailAsDefault')}</Text>
                    <TextLink
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                        suppressHighlighting
                    >
                        {` ${translate('teachersUnitePage.contactMethods')}`}
                    </TextLink>
                </Text>
            </View>
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    accessibilityLabel={translate('teachersUnitePage.updateEmail')}
                    text={translate('teachersUnitePage.updateEmail')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ImTeacherPage.propTypes = propTypes;
ImTeacherPage.defaultProps = defaultProps;
ImTeacherPage.displayName = 'ImTeacherPage';

export default ImTeacherPage;
