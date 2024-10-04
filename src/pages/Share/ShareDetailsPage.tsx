import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>;

function ShareDetailsPage({
    route: {
        params: {reportID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                {/* <UserListItem
                    item={{}}
                    isFocused={false}
                    showTooltip={false}
                    onSelectRow={() => {}}
                    pressableStyle={styles.flexRow}
                    shouldSyncFocus={false}
                /> */}
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
