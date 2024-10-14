import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AttachmentPreview from '@components/AttachmentPreview';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as Report from '@userActions/Report';
import UserListItem from '@src/components/SelectionList/UserListItem';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>;

function ShareDetailsPage({
    route: {
        params: {reportID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [tempShareFiles] = useOnyx(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}`);

    const [message, setMessage] = useState('');

    const currentAttachment = useMemo(() => {
        return Object.values(tempShareFiles ?? {})
            .sort((a, b) => Number(b?.processedAt) - Number(a?.processedAt))
            .at(0);
    }, [tempShareFiles]);

    const reportDisplay = OptionsListUtils.getReportDisplayOption(report);

    const handleShare = () => {
        if (!currentAttachment) {
            return;
        }
        FileUtils.readFileAsync(
            currentAttachment.content,
            currentAttachment.id,
            (file) => {
                Report.addAttachment(reportID, file, message);

                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
                Navigation.navigate(routeToNavigate);
            },
            () => {},
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={ShareDetailsPage.displayName}
        >
            <View style={[styles.flex1, styles.flexColumn, styles.h100]}>
                <HeaderWithBackButton
                    title={translate('share.shareToExpensify')}
                    shouldShowBackButton
                />
                {report && (
                    <>
                        <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                        </View>
                        <UserListItem
                            item={reportDisplay}
                            isFocused={false}
                            showTooltip={false}
                            onSelectRow={() => {}}
                            pressableStyle={[styles.flexRow]}
                            shouldSyncFocus={false}
                            isDisabled
                        />
                    </>
                )}

                <View style={[styles.ph5, styles.justifyContentBetween, styles.flexGrow1, styles.flexColumn]}>
                    <View style={styles.justifyContentCenter}>
                        <View style={[styles.pv5]}>
                            <TextInput
                                value={message}
                                onChangeText={(value) => {
                                    setMessage(value);
                                }}
                                accessibilityLabel={translate('share.messageInputLabel')}
                                label={translate('share.messageInputLabel')}
                            />
                        </View>
                        <View style={[styles.pt6, styles.pb2]}>
                            <Text style={[styles.textLabelSupporting]}>{translate('common.attachment')}</Text>
                        </View>
                        <AttachmentPreview
                            uri={currentAttachment?.content}
                            aspectRatio={currentAttachment?.aspectRatio}
                        />
                    </View>

                    <View style={[styles.flexGrow1, styles.flexColumn, styles.justifyContentEnd]}>
                        <Button
                            success
                            large
                            text={translate('common.share')}
                            style={[styles.w100]}
                            onPress={handleShare}
                        />
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
}

ShareDetailsPage.displayName = 'ShareDetailsPage';
export default ShareDetailsPage;
