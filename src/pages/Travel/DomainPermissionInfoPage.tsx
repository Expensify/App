import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type DomainPermissionInfoPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO>;

function DomainPermissionInfoPage({route}: DomainPermissionInfoPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={DomainPermissionInfoPage.displayName}
        >
            <HeaderWithBackButton title={translate('travel.domainPermissionInfo.title')} />
            <View style={[styles.flex1]}>
                <Text style={[styles.mt3, styles.mr5, styles.ml5]}>
                    {`${translate('travel.domainPermissionInfo.restrictionPrefix')}`} <Text style={styles.textStrong}>{route.params.domain}</Text>
                    {'. '}
                    {`${translate('travel.domainPermissionInfo.restrictionSuffix')}`}
                </Text>
                <Text style={[styles.mt3, styles.mr5, styles.ml5]}>
                    {`${translate('travel.domainPermissionInfo.accountantInvitationPrefix')}`}{' '}
                    <TextLink onPress={() => openExternalLink(CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL)}>
                        {`${translate('travel.domainPermissionInfo.accountantInvitationLink')}`}
                    </TextLink>{' '}
                    {`${translate('travel.domainPermissionInfo.accountantInvitationSuffix')}`}
                </Text>
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={() => Navigation.closeRHPFlow()}
                    text={translate('common.buttonConfirm')}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

DomainPermissionInfoPage.displayName = 'DomainPermissionInfoPage';

export default DomainPermissionInfoPage;
