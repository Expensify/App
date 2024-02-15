import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Modal from '@components/Modal';
import type { WorkspaceSingleIntegrationImportStatus } from '@src/types/onyx';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { PressableWithFeedback } from '@components/Pressable';
import Tooltip from '@components/Tooltip';

type IntegrationSyncProgressProps = {
    /** The policy ID currently being configured */
    syncStatus: WorkspaceSingleIntegrationImportStatus;
    onClose: () => void;
};

function IntegrationSyncProgress({syncStatus, onClose}: IntegrationSyncProgressProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const integrationName = 'Quickbooks Online';

    return (
        <Modal
            onClose={onClose}
            fullscreen={!isSmallScreenWidth}
            isVisible
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            style={isSmallScreenWidth ? undefined : {...styles.w70, backgroundColor: '#F00'}}
        >
            <View style={[styles.screenCenteredContainer, styles.alignItemsStretch, styles.justifyContentBetween]}>
                <View style={[styles.alignItemsEnd, styles.pb4]}>
                    <Tooltip text={translate('common.close')}>
                        <PressableWithFeedback
                            onPress={onClose}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.close')}
                        >
                            <Icon
                                src={Expensicons.Close}
                                fill={theme.icon}
                            />
                        </PressableWithFeedback>
                    </Tooltip>
                </View>
                <View style={styles.alignItemsCenter}>
                    <View style={[styles.flexRow, styles.p1]}>
                        <Icon
                            src={Expensicons.NewExpensify}
                            width={variables.appModalAppIconSize}
                            height={variables.appModalAppIconSize}
                            fill={theme.success}
                        />
                        <Icon
                            src={Expensicons.DotIndicator}
                            additionalStyles={[styles.ml2, styles.justifyContentCenter]}
                            width={variables.iconSizeXXXSmall}
                            height={variables.iconSizeXXXSmall}
                            fill={theme.text}
                        />
                        <Icon
                            src={Expensicons.DotIndicator}
                            additionalStyles={[styles.mh1, styles.justifyContentCenter]}
                            width={variables.iconSizeXXXSmall}
                            height={variables.iconSizeXXXSmall}
                            fill={theme.text}
                        />
                        <Icon
                            src={Expensicons.DotIndicator}
                            additionalStyles={[styles.mr2, styles.justifyContentCenter]}
                            width={variables.iconSizeXXXSmall}
                            height={variables.iconSizeXXXSmall}
                            fill={theme.text}
                        />
                        <Icon
                            src={Expensicons.NewExpensify}
                            width={variables.appModalAppIconSize}
                            height={variables.appModalAppIconSize}
                            fill={theme.success}
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mt2]}>
                        {translate(`workspace.integrationSyncStatus.${syncStatus.status}`)}
                    </Text>
                    <Text style={[styles.textSupporting, styles.textAlignCenter, styles.mb6]}>
                        {translate('workspace.integrationSyncSupportingText', {integrationName})}
                    </Text>
                    {syncStatus.stagesCompleted.map(stage => 
                        <View style={[styles.flexRow, styles.p1]}>
                            <Icon 
                                fill={theme.success}
                                src={Expensicons.Checkmark}
                            />
                            <Text style={styles.ml2}>
                                {translate(`workspace.integrationSyncStage`, {stage})}
                            </Text>
                        </View>
                    )}
                    {syncStatus.status === 'progress' &&
                        <View style={[styles.flexRow, styles.p1]}>
                            <ActivityIndicator
                                color={theme.success}
                                size="small"
                            />
                            <Text style={styles.ml2}>
                                {translate('workspace.integrationSyncProgressText', {integrationName})}
                            </Text>
                        </View>
                    }
                </View>
            </View>
        </Modal>
    );
}

IntegrationSyncProgress.displayName = 'IntegrationSyncProgress';

export default IntegrationSyncProgress;
