import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';

import type {ViewProps} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MessageEditCancelButtonProps = ViewProps & {
    /** Handle clicking on cancel button */
    onCancel: () => void;

    /** The test ID to use for the button */
    testID?: string;
};

function MessageEditCancelButton({onCancel, testID, ...restProps}: MessageEditCancelButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    // Drop the extra marginVertical the cancel button used to add: once composerSizeButton grew to 40px it
    // left zero slack, so the edit compose box rounded up past the main composer's height. See
    // https://github.com/Expensify/App/issues/99143. The 3px of vertical spacing now lives on the wrapper's
    // paddingBottom (messageEditCancelButtonWrapper), which keeps the button centered on a single line
    // without feeding the compose box's intrinsic min-height.
    const closeButtonStyles = [styles.composerSizeButton];

    return (
        <View {...restProps}>
            <Tooltip text={translate('common.cancel')}>
                <PressableWithoutFeedback
                    testID={testID}
                    onPress={onCancel}
                    style={({hovered, pressed}) => [...closeButtonStyles, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                    // Keep focus on the composer when cancel button is clicked.
                    onMouseDown={(e) => e.preventDefault()}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_EDIT_CANCEL_BUTTON}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            src={icons.Close}
                        />
                    )}
                </PressableWithoutFeedback>
            </Tooltip>
        </View>
    );
}

export default MessageEditCancelButton;
