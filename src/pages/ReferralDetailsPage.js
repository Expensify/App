import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
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
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {CONTEXT_MENU_TYPES} from './home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from './home/report/ContextMenu/ReportActionContextMenu';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The type of the content from where CTA was called */
            contentType: PropTypes.string,
        }),
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,
    }),
};

const defaultProps = {
    account: null,
};

function ReferralDetailsPage({route, account}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const popoverAnchor = useRef(null);
    const {isExecuting, singleExecution} = useSingleExecution();
    let {contentType} = route.params;

    if (!_.includes(_.values(CONST.REFERRAL_PROGRAM.CONTENT_TYPES), contentType)) {
        contentType = CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
    }

    const contentHeader = translate(`referralProgram.${contentType}.header`);
    const contentBody = translate(`referralProgram.${contentType}.body`);
    const isShareCode = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE;
    const shouldShowClipboard = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND || isShareCode;
    const referralLink = `${CONST.REFERRAL_PROGRAM.LINK}/?thanks=${encodeURIComponent(account.primaryLogin)}`;

    return (
        <HeaderPageLayout
            title={translate('common.referral')}
            headerContent={
                <Icon
                    src={PaymentHands}
                    width={178}
                    height={232}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentEnd]}
            backgroundColor={theme.PAGE_THEMES[SCREENS.RIGHT_MODAL.REFERRAL].backgroundColor}
        >
            <Text style={[styles.textHeadline, styles.mb3, styles.mt3, styles.ph4]}>{contentHeader}</Text>
            <Text style={[styles.inlineSystemMessage, styles.ml0, styles.mb6, styles.ph4]}>{contentBody}</Text>

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
                onSecondaryInteraction={(e) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK, popoverAnchor.current)}
            />
        </HeaderPageLayout>
    );
}

ReferralDetailsPage.displayName = 'ReferralDetailsPage';
ReferralDetailsPage.propTypes = propTypes;
ReferralDetailsPage.defaultProps = defaultProps;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(ReferralDetailsPage);
