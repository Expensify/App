import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type MemberDetailsMenuItem = {
    key: string;
    title: string;
    icon: IconAsset;
    onPress: () => void | Promise<void>;
    shouldShowRightIcon?: boolean;
};

type BaseDomainMemberDetailsComponentProps = {
    /** ID domeny dla wrappera NotFound */
    domainAccountID: number;

    /** ID konta użytkownika */
    accountID: number;

    /** Lista pozycji menu (np. profil, uprawnienia) */
    menuItems: MemberDetailsMenuItem[];

    /** Opcjonalny przycisk pod awatarem (np. Close Account) */
    actionButton?: React.ReactNode;

    /** Dodatkowy kontent na dole strony */
    children?: React.ReactNode;
};

function BaseDomainMemberDetailsComponent({domainAccountID, accountID, menuItems, actionButton, children}: BaseDomainMemberDetailsComponentProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const phoneNumber = getPhoneNumber(details);

    const memberLogin = details.login ?? '';
    const isSMSLogin = Str.isSMSLogin(memberLogin);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={BaseDomainMemberDetailsComponent.displayName}
            >
                <HeaderWithBackButton title={displayName} />

                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={details.avatar}
                                    avatarID={accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.X_LARGE}
                                    fallbackIcon={details.fallbackIcon}
                                />
                            </OfflineWithFeedback>

                            {/* Renderujemy przycisk akcji tylko jeśli został przekazany */}
                            {actionButton}

                            {!!displayName && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                        </View>
                    </View>

                    <MenuItemWithTopDescription
                        title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                        copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                        description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                        interactive={false}
                        copyable
                    />

                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.key}
                            icon={item.icon}
                            title={item.title}
                            onPress={item.onPress}
                            shouldShowRightIcon={item.shouldShowRightIcon}
                        />
                    ))}

                    {children}
                </ScrollView>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainMemberDetailsComponent.displayName = 'BaseDomainMemberDetailsComponent';

export type {MemberDetailsMenuItem};
export default BaseDomainMemberDetailsComponent;
