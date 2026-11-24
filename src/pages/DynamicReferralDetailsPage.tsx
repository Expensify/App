import ContextMenuItem from '@components/ContextMenuItem';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReferralDetailsNavigatorParamList} from '@libs/Navigation/types';

import colors from '@styles/theme/colors';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

type DynamicReferralDetailsPageProps = PlatformStackScreenProps<ReferralDetailsNavigatorParamList, typeof SCREENS.DYNAMIC_REFERRAL_DETAILS>;

function DynamicReferralDetailsPage({route}: DynamicReferralDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Copy', 'QuestionMark']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['PaymentHands']);
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {isExecuting, singleExecution} = useSingleExecution();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REFERRAL_DETAILS.path);
    let {contentType} = route.params;

    if (!Object.values(CONST.REFERRAL_PROGRAM.CONTENT_TYPES).includes(contentType)) {
        contentType = CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
    }

    const contentHeader = translate(`referralProgram.${contentType}.header`);
    const contentBody = translate(`referralProgram.${contentType}.body`);
    const isShareCode = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE;
    const shouldShowClipboard = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND || isShareCode;
    const referralLink = `${CONST.REFERRAL_PROGRAM.LINK}${account?.primaryLogin ? `/?thanks=${account.primaryLogin}` : ''}`;

    return (
        <HeaderPageLayout
            title={translate('common.referral')}
            headerContent={
                <Icon
                    src={illustrations.PaymentHands}
                    width={589}
                    height={232}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(colors.pink800)]}
            testID="DynamicReferralDetailsPage"
            onBackButtonPress={() => {
                Navigation.goBack(backPath);
            }}
        >
            <Text style={[styles.textHeadline, styles.mb2, styles.ph5]}>{contentHeader}</Text>
            <Text style={[styles.webViewStyles.baseFontStyle, styles.ml0, styles.mb5, styles.ph5]}>{contentBody}</Text>

            {shouldShowClipboard && (
                <ContextMenuItem
                    sentryLabel={CONST.SENTRY_LABEL.REFERRAL_PROGRAM.COPY_LINK}
                    isAnonymousAction
                    text={translate('referralProgram.copyReferralLink')}
                    icon={icons.Copy}
                    successIcon={icons.Checkmark}
                    successText={translate('qrCodes.copied')}
                    onPress={() => Clipboard.setString(referralLink)}
                    shouldLimitWidth={false}
                />
            )}

            <MenuItem.Root
                sentryLabel={CONST.SENTRY_LABEL.REFERRAL_PROGRAM.LEARN_MORE}
                style={styles.mb4}
                isDisabled={isExecuting}
                onPress={callIfAuthenticated(
                    singleExecution(() => openExternalLink(CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK)),
                    session,
                )}
            >
                <View style={[styles.flexRow, StyleUtils.getMenuItemTextContainerStyle(false)]}>
                    <MenuItem.Leading>
                        <View style={styles.mr3}>
                            <MenuItem.Icon src={icons.QuestionMark} />
                        </View>
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{translate('requestorStep.learnMore')}</MenuItem.Title>
                    </MenuItem.Content>
                    <MenuItem.Trailing>
                        <MenuItem.ExternalLink link={CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK} />
                    </MenuItem.Trailing>
                </View>
            </MenuItem.Root>
        </HeaderPageLayout>
    );
}

export default DynamicReferralDetailsPage;
