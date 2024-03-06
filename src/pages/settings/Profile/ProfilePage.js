import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import {translatableTextPropTypes} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */

    /** Login list for the user that is signed in */
    loginList: PropTypes.objectOf(
        PropTypes.shape({
            /** Date login was validated, used to show brickroad info status */
            validatedDate: PropTypes.string,

            /** Field-specific server side errors keyed by microtime */
            errorFields: PropTypes.objectOf(PropTypes.objectOf(translatableTextPropTypes)),
        }),
    ),

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        dob: PropTypes.string,

        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    loginList: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
        dob: '',
        address: {
            street: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

function ProfilePage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const getPronouns = () => {
        let pronounsKey = lodashGet(props.currentUserPersonalDetails, 'pronouns', '');
        if (pronounsKey.startsWith(CONST.PRONOUNS.PREFIX)) {
            pronounsKey = pronounsKey.slice(CONST.PRONOUNS.PREFIX.length);
        }

        if (!pronounsKey) {
            return props.translate('profilePage.selectYourPronouns');
        }
        return props.translate(`pronouns.${pronounsKey}`);
    };
    const currentUserDetails = props.currentUserPersonalDetails || {};
    const contactMethodBrickRoadIndicator = UserUtils.getLoginListBrickRoadIndicator(props.loginList);
    const emojiCode = lodashGet(props, 'currentUserPersonalDetails.status.emojiCode', '');
    const {isSmallScreenWidth} = useWindowDimensions();
    usePrivatePersonalDetails();
    const privateDetails = props.privatePersonalDetails || {};
    const legalName = `${privateDetails.legalFirstName || ''} ${privateDetails.legalLastName || ''}`.trim();
    const isLoadingPersonalDetails = lodashGet(props.privatePersonalDetails, 'isLoading', true);

    const publicOptions = [
        {
            description: props.translate('displayNamePage.headerTitle'),
            title: lodashGet(currentUserDetails, 'displayName', ''),
            pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
        },
        {
            description: props.translate('contacts.contactMethod'),
            title: props.formatPhoneNumber(lodashGet(currentUserDetails, 'login', '')),
            pageRoute: ROUTES.SETTINGS_CONTACT_METHODS.route,
            brickRoadIndicator: contactMethodBrickRoadIndicator,
        },
        {
            description: props.translate('statusPage.status'),
            title: emojiCode ? `${emojiCode} ${lodashGet(props, 'currentUserPersonalDetails.status.text', '')}` : '',
            pageRoute: ROUTES.SETTINGS_STATUS,
        },
        {
            description: props.translate('pronounsPage.pronouns'),
            title: getPronouns(),
            pageRoute: ROUTES.SETTINGS_PRONOUNS,
        },
        {
            description: props.translate('timezonePage.timezone'),
            title: `${lodashGet(currentUserDetails, 'timezone.selected', '')}`,
            pageRoute: ROUTES.SETTINGS_TIMEZONE,
        },
    ];

    useEffect(() => {
        App.openProfile(props.currentUserPersonalDetails);
    }, [props.currentUserPersonalDetails]);

    const privateOptions = [
        {
            description: props.translate('privatePersonalDetails.legalName'),
            title: legalName,
            pageRoute: ROUTES.SETTINGS_LEGAL_NAME,
        },
        {
            description: props.translate('common.dob'),
            title: privateDetails.dob || '',
            pageRoute: ROUTES.SETTINGS_DATE_OF_BIRTH,
        },
        {
            description: props.translate('privatePersonalDetails.address'),
            title: PersonalDetailsUtils.getFormattedAddress(props.privatePersonalDetails),
            pageRoute: ROUTES.SETTINGS_ADDRESS,
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ProfilePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={props.translate('common.profile')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={props.isSmallScreenWidth}
                icon={Illustrations.Profile}
            />
            <ScrollView style={styles.pt3}>
                <MenuItemGroup>
                    <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={props.translate('profilePage.publicSection.title')}
                            subtitle={props.translate('profilePage.publicSection.subtitle')}
                            isCentralPane
                            subtitleMuted
                            childrenStyles={styles.pt5}
                            titleStyles={styles.accountSettingsSectionTitle}
                        >
                            {_.map(publicOptions, (detail, index) => (
                                <MenuItemWithTopDescription
                                    key={`${detail.title}_${index}`}
                                    shouldShowRightIcon
                                    title={detail.title}
                                    description={detail.description}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={() => Navigation.navigate(detail.pageRoute)}
                                    brickRoadIndicator={detail.brickRoadIndicator}
                                />
                            ))}
                        </Section>
                        <Section
                            title={props.translate('profilePage.privateSection.title')}
                            subtitle={props.translate('profilePage.privateSection.subtitle')}
                            isCentralPane
                            subtitleMuted
                            childrenStyles={styles.pt3}
                            titleStyles={styles.accountSettingsSectionTitle}
                        >
                            {isLoadingPersonalDetails ? (
                                <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative, StyleUtils.getBackgroundColorStyle(theme.cardBG)]} />
                            ) : (
                                <>
                                    {_.map(privateOptions, (detail, index) => (
                                        <MenuItemWithTopDescription
                                            key={`${detail.title}_${index}`}
                                            shouldShowRightIcon
                                            title={detail.title}
                                            description={detail.description}
                                            wrapperStyle={styles.sectionMenuItemTopDescription}
                                            onPress={() => Navigation.navigate(detail.pageRoute)}
                                        />
                                    ))}
                                </>
                            )}
                        </Section>
                    </View>
                </MenuItemGroup>
            </ScrollView>
        </ScreenWrapper>
    );
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withCurrentUserPersonalDetails,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(ProfilePage);
