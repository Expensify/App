import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {useSession} from '@components/OnyxProvider';
import QRShare from '@components/QRShare';
import type {QRShareHandle} from '@components/QRShare/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

const adminsRoomMentionText = '#admins';

function WorkspaceProfileSharePage({policy}: WithPolicyProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareHandle>(null);
    const {isSmallScreenWidth} = useWindowDimensions();
    const session = useSession();

    const policyName = policy?.name ?? '';
    const id = policy?.id ?? '-1';
    const adminEmail = session?.email ?? '';
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);

    const url = `${urlWithTrailingSlash}${ROUTES.WORKSPACE_JOIN_USER.getRoute(id, adminEmail)}`;
    const adminRoom = useMemo(() => {
        if (!policy?.id) {
            return undefined;
        }
        return ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policy?.id);
    }, [policy?.id]);

    const shareNote = useMemo(() => {
        const header = translate('workspace.common.shareNote.header');
        const content = translate('workspace.common.shareNote.content');
        const adminRoomMentionIndex = content.indexOf(adminsRoomMentionText);
        return {
            header,
            contentParts: [content.slice(0, adminRoomMentionIndex), content.slice(adminRoomMentionIndex + adminsRoomMentionText.length)],
        };
    }, [translate]);

    return (
        <AccessOrNotFoundWrapper
            policyID={id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                testID={WorkspaceProfileSharePage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('common.share')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView style={[themeStyles.flex1, themeStyles.pt2]}>
                    <View style={[themeStyles.flex1, isSmallScreenWidth ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection]}>
                        <View style={[themeStyles.mh5, themeStyles.mv1]}>
                            <Text style={[themeStyles.textHeadlineH1, themeStyles.mt2]}>{shareNote.header}</Text>
                        </View>
                        <View style={[themeStyles.mh5, themeStyles.mt1, themeStyles.mb9]}>
                            <Text style={[themeStyles.textNormal, themeStyles.mt2]}>
                                {shareNote.contentParts[0]}
                                <TextLink
                                    style={themeStyles.link}
                                    onPress={() => {
                                        if (!adminRoom?.reportID) {
                                            return;
                                        }
                                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminRoom.reportID));
                                    }}
                                >
                                    #admins
                                </TextLink>
                                {shareNote.contentParts[1]}
                            </Text>
                        </View>

                        <View style={[themeStyles.workspaceSectionMobile, themeStyles.ph9]}>
                            {/* 
                            Right now QR code download button is not shown anymore
                            This is a temporary measure because right now it's broken because of the Fabric update.
                            We need to wait for react-native v0.74 to be released so react-native-view-shot gets fixed.
                            
                            Please see https://github.com/Expensify/App/issues/40110 to see if it can be re-enabled.
                        */}
                            <QRShare
                                ref={qrCodeRef}
                                url={url}
                                title={policyName}
                                logo={(policy?.avatarURL ? policy.avatarURL : expensifyLogo) as ImageSourcePropType}
                                logoRatio={CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                                logoMarginRatio={CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                            />
                        </View>

                        <View style={[themeStyles.mt3, themeStyles.ph4]}>
                            <ContextMenuItem
                                isAnonymousAction
                                text={translate('qrCodes.copy')}
                                icon={Expensicons.Copy}
                                successIcon={Expensicons.Checkmark}
                                successText={translate('qrCodes.copied')}
                                onPress={() => Clipboard.setString(url)}
                                shouldLimitWidth={false}
                                wrapperStyle={themeStyles.sectionMenuItemTopDescription}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfileSharePage.displayName = 'WorkspaceProfileSharePage';

export default withPolicy(WorkspaceProfileSharePage);
