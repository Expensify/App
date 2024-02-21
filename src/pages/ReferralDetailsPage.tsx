import type {StackScreenProps} from '@react-navigation/stack';
import React, {useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PaymentHands} from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import type {ReferralDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';
import * as ReportActionContextMenu from './home/report/ContextMenu/ReportActionContextMenu';

type ReferralDetailsPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type ReferralDetailsPageProps = ReferralDetailsPageOnyxProps & StackScreenProps<ReferralDetailsNavigatorParamList, typeof SCREENS.REFERRAL_DETAILS>;

function ReferralDetailsPage({route, account}: ReferralDetailsPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const popoverAnchor = useRef(null);
    const {isExecuting, singleExecution} = useSingleExecution();
    let {contentType} = route.params;
    const {backTo} = route.params;

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
                    src={PaymentHands}
                    width={589}
                    height={232}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentEnd]}
            backgroundColor={theme.PAGE_THEMES[SCREENS.REFERRAL_DETAILS].backgroundColor}
            testID={ReferralDetailsPage.displayName}
            onBackButtonPress={() => {
                if (backTo) {
                    Navigation.goBack(backTo as Route);
                    return;
                }
                Navigation.goBack();
            }}
        >
            <Text style={[styles.textHeadline, styles.mb2, styles.ph5]}>{contentHeader}</Text>
            <Text style={[styles.webViewStyles.baseFontStyle, styles.ml0, styles.mb5, styles.ph5]}>{contentBody}</Text>

            {shouldShowClipboard && (
                <ContextMenuItem
                    isAnonymousAction
                    text={translate('referralProgram.copyReferralLink')}
                    icon={Expensicons.Copy}
                    successIcon={Expensicons.Checkmark}
                    successText={translate('qrCodes.copied')}
                    onPress={() => Clipboard.setString(referralLink)}
                />
            )}

            <MenuItem
                wrapperStyle={styles.mb4}
                ref={popoverAnchor}
                title={translate('requestorStep.learnMore')}
                icon={Expensicons.QuestionMark}
                shouldShowRightIcon
                iconRight={Expensicons.NewWindow}
                disabled={isExecuting}
                shouldBlockSelection
                onPress={singleExecution(() => Link.openExternalLink(CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK))}
                onSecondaryInteraction={(e) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, e, CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK, popoverAnchor.current)}
            />
        </HeaderPageLayout>
    );
}

ReferralDetailsPage.displayName = 'ReferralDetailsPage';

export default withOnyx<ReferralDetailsPageProps, ReferralDetailsPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(ReferralDetailsPage);
