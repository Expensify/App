import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRevokeError, revokeDevice} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {getLoginKey, getRevokableLogins} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Login} from '@src/types/onyx/Logins';

function DeviceManagementPage() {
    const styles = useThemeStyles();
    const {translate, datetimeToRelative} = useLocalize();

    const [logins] = useOnyx(ONYXKEYS.LOGINS);

    const renderItem = ({item}: ListRenderItemInfo<Login>) => {
        const {deviceName, deviceVersion, os, osVersion} = item.additionalData;
        return (
            <OfflineWithFeedback
                pendingAction={item.pendingAction}
                errors={item.errorFields?.revoke}
                onClose={() => clearRevokeError(getLoginKey(item))}
                contentContainerStyle={[styles.flexRow, styles.alignItemsCenter, styles.pv3, styles.gap3]}
            >
                <View style={[styles.flex1, styles.flexColumn, styles.gap1]}>
                    <Text style={[styles.textLabelSupporting]}>{datetimeToRelative(item.lastLogin)}</Text>
                    <Text>
                        {deviceName} {deviceVersion ? `${deviceVersion} ` : ''}({os} {osVersion})
                    </Text>
                </View>
                <Button
                    danger
                    small
                    text={translate('deviceManagementPage.revoke')}
                    onPress={() => revokeDevice(item)}
                />
            </OfflineWithFeedback>
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="DeviceManagementPage"
        >
            <HeaderWithBackButton
                title={translate('deviceManagementPage.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.ph5, styles.pv3]}>
                <RenderHTML html={translate('deviceManagementPage.description')} />
            </View>
            <FlashList
                data={getRevokableLogins(logins)}
                renderItem={renderItem}
                keyExtractor={getLoginKey}
                maintainVisibleContentPosition={{disabled: true}}
                contentContainerStyle={[styles.ph5]}
            />
        </ScreenWrapper>
    );
}

export default DeviceManagementPage;
