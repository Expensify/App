import {useFeatureTrainingActions} from '@components/FeatureTraining/context';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const CONTENT_PADDING = variables.spacing2;

function CloseButton() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const {handleClose} = useFeatureTrainingActions();

    return (
        <View style={StyleUtils.getFeatureTrainingCarouselCloseButtonContainerStyle(CONTENT_PADDING)}>
            <Tooltip text={translate('common.close')}>
                <PressableWithFeedback
                    onPress={handleClose}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                    sentryLabel={CONST.SENTRY_LABEL.FEATURE_TRAINING.CLOSE_BUTTON}
                    style={[styles.p2, styles.opacitySemiTransparent]}
                >
                    <Icon
                        src={expensifyIcons.Close}
                        fill={theme.buttonSuccessText}
                    />
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

CloseButton.displayName = 'FeatureTraining.CloseButton';

export default CloseButton;
