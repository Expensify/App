import React from 'react';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import FixedFooter from '../../components/FixedFooter';
import BlockingView from '../../components/BlockingViews/BlockingView';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import * as Illustrations from '../../components/Icon/Illustrations';
import variables from '../../styles/variables';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function ImTeacherPage(props) {
    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={props.translate('teachersUnitePage.iAmATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <BlockingView
                shouldShowLink
                icon={Illustrations.EmailAddress}
                title={props.translate('teachersUnitePage.updateYourEmail')}
                subtitle={props.translate('teachersUnitePage.schoolMailAsDefault')}
                link={props.translate('teachersUnitePage.contactMethods')}
                onLinkPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                iconWidth={variables.signInLogoWidthLargeScreen}
                iconHeight={variables.lhnLogoWidth}
            />
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    accessibilityLabel={props.translate('teachersUnitePage.updateEmail')}
                    text={props.translate('teachersUnitePage.updateEmail')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ImTeacherPage.propTypes = propTypes;
ImTeacherPage.defaultProps = defaultProps;
ImTeacherPage.displayName = 'ImTeacherPage';

export default withLocalize(ImTeacherPage);
