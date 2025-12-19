import React, {useRef} from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReferralDetailsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {showContextMenu} from './home/report/ContextMenu/ReportActionContextMenu';

type ReferralDetailsPageProps = PlatformStackScreenProps<ReferralDetailsNavigatorParamList, typeof SCREENS.REFERRAL_DETAILS>;

function ReferralDetailsPage({route}: ReferralDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'QuestionMark']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PaymentHands']);
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
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
                    src={illustrations.PaymentHands}
                    width={589}
                    height={232}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentEnd]}
            backgroundColor={theme.PAGE_THEMES[SCREENS.REFERRAL_DETAILS].backgroundColor}
            testID="ReferralDetailsPage"
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
                icon={icons.QuestionMark}
                shouldShowRightIcon
                iconRight={icons.NewWindow}
                disabled={isExecuting}
                shouldBlockSelection
                onPress={singleExecution(() => openExternalLink(CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK))}
                onSecondaryInteraction={(e) =>
                    showContextMenu({
                        type: CONST.CONTEXT_MENU_TYPES.LINK,
                        event: e,
                        selection: CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK,
                        contextMenuAnchor: popoverAnchor.current,
                    })
                }
            />
        </HeaderPageLayout>
    );
}

export default ReferralDetailsPage;
