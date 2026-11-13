import FSClassView from '@components/FSClassView';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import TextWithMiddleEllipsis from '@components/TextWithMiddleEllipsis';
import Tooltip from '@components/Tooltip';
import type UploadFileProps from '@components/UploadFile/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

type UploadedFileChipProps = Pick<UploadFileProps, 'onRemove' | 'shouldExtendRemoveTouchArea'> & {
    file: FileObject;
};

/** One uploaded file: its name with a paperclip, and a button that removes it */
function UploadedFileChip({file, onRemove, shouldExtendRemoveTouchArea = false}: UploadedFileChipProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Paperclip']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    return (
        <FSClassView
            style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.border, styles.p5, styles.mt3, styles.mw100]}
            // Uploaded files are ID and company documents, and their names often hold the person's name
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        >
            <Icon
                src={icons.Paperclip}
                fill={theme.icon}
                size={CONST.ICON_SIZE.MEDIUM}
            />
            <TextWithMiddleEllipsis
                text={file.name ?? ''}
                style={[styles.ml2, styles.mr2, styles.w100, styles.flexShrink1]}
                textStyle={styles.textBold}
            />
            <Tooltip text={translate('common.remove')}>
                <PressableWithFeedback
                    onPress={() => onRemove(file?.name ?? '')}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={`${translate('common.remove')}, ${file.name ?? ''}`}
                    sentryLabel={CONST.SENTRY_LABEL.UPLOAD_FILE.REMOVE_BUTTON}
                    shouldUseAutoHitSlop={shouldExtendRemoveTouchArea}
                >
                    <Icon
                        src={icons.Close}
                        fill={theme.icon}
                        size={CONST.ICON_SIZE.MEDIUM}
                    />
                </PressableWithFeedback>
            </Tooltip>
        </FSClassView>
    );
}

export default UploadedFileChip;
