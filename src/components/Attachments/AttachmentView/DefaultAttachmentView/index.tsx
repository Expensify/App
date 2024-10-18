import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type DefaultAttachmentViewProps = {
    /** The name of the file */
    fileName?: string;

    /** Should show the download icon */
    shouldShowDownloadIcon?: boolean;

    /** Should show the loading spinner icon */
    shouldShowLoadingSpinnerIcon?: boolean;

    /** Additional styles for the container */
    containerStyles?: StyleProp<ViewStyle>;

    icon?: IconAsset;

    /** Whether the attachment is deleted */
    isDeleted?: boolean;
};

function DefaultAttachmentView({fileName = '', shouldShowLoadingSpinnerIcon = false, shouldShowDownloadIcon, containerStyles, icon, isDeleted}: DefaultAttachmentViewProps) {
    /** Flag indicating if the attachment is being uploaded. */
    isUploading?: boolean;
};

function DefaultAttachmentView({fileName = '', shouldShowLoadingSpinnerIcon = false, shouldShowDownloadIcon, containerStyles, icon, isUploading}: DefaultAttachmentViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.defaultAttachmentView, containerStyles]}>
            <View style={styles.mr2}>
                <Icon
                    fill={theme.icon}
                    src={icon ?? Expensicons.Paperclip}
                />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100, isDeleted && styles.lineThrough]}>{fileName}</Text>
            {!shouldShowLoadingSpinnerIcon && shouldShowDownloadIcon && (
                <Tooltip text={translate('common.download')}>
                    <View style={styles.ml2}>
                        <Icon
                            fill={theme.icon}
                            src={Expensicons.Download}
                        />
                    </View>
                </Tooltip>
            )}
            {shouldShowLoadingSpinnerIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={isUploading ? translate('common.uploading') : translate('common.downloading')}>
                        <ActivityIndicator
                            size="small"
                            color={theme.textSupporting}
                        />
                    </Tooltip>
                </View>
            )}
        </View>
    );
}

DefaultAttachmentView.displayName = 'DefaultAttachmentView';

export default DefaultAttachmentView;
