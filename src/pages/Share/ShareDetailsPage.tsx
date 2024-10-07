import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AttachmentPreview from '@components/AttachmentPreview';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ShareActions from '@userActions/Share';
import UserListItem from '@src/components/SelectionList/UserListItem';
import ShareActionHandlerModule from '@src/modules/ShareActionHandlerModule';
import ONYXKEYS from '@src/ONYXKEYS';
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

    const handleProcessFiles = () => {
        ShareActionHandlerModule.processFiles((processedFiles) => {
            // eslint-disable-next-line no-console
            const tempFile = processedFiles.at(0);
            if (tempFile) {
                ShareActions.addTempShareFile({...tempFile, reportID, readyForRemoval: false});
            }
        });
    };

    useEffect(() => {
        handleProcessFiles();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentAttachment = useMemo(() => {
        return Object.values(tempShareFiles ?? {})
            ?.filter((file) => file?.reportID === reportID)
            .sort((a, b) => Number(b?.processedAt) - Number(a?.processedAt))
            .at(0);
    }, [reportID, tempShareFiles]);

    // const submitForm = useCallback(
    //     (newComment: string) => {
    //         playSound(SOUNDS.DONE);

    //         const newCommentTrimmed = newComment.trim();

    //         if (attachmentFileRef.current) {
    //             Report.addAttachment(reportID, attachmentFileRef.current, newCommentTrimmed);
    //             attachmentFileRef.current = null;
    //         } else {
    //             Performance.markStart(CONST.TIMING.MESSAGE_SENT, {message: newCommentTrimmed});
    //             onSubmit(newCommentTrimmed);
    //         }
    //     },
    //     [onSubmit, reportID],
    // );

    // const formattedSelectedParticipants = Object.values(report?.participants?).map((participant) => ({
    //     ...participant,
    //     isSelected: false,
    //     isInteractive: false,
    // }));

    const reportTest = OptionsListUtils.getReportDisplayOption(report);

    console.log('CURRENT ATTACHMENT ', currentAttachment);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={ShareDetailsPage.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    title={translate('iou.shareRoot.shareToExpensify')}
                    shouldShowBackButton
                />
                {report && (
                    <>
                        <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                        </View>
                        <UserListItem
                            item={reportTest}
                            isFocused={false}
                            showTooltip={false}
                            onSelectRow={() => {}}
                            pressableStyle={[styles.flexRow]}
                            shouldSyncFocus={false}
                        />
                    </>
                )}

                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                </View>
                <AttachmentPreview uri={currentAttachment?.content} />
                {/* {imageURIs.map((uri) => (
                    <Image
                        key={`image-${uri}`}
                        source={{uri}} // Note the change here
                        style={{width: 100, height: 100}}
                    />
                ))} */}
            </View>
        </ScreenWrapper>
    );
}

ShareDetailsPage.displayName = 'ShareDetailsPage';
export default ShareDetailsPage;
