import React, { useState } from 'react';
import {ActivityIndicator, View} from 'react-native';
import Text from '@components/Text';
// import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Modal from '@components/Modal';
import type { WorkspaceSingleIntegrationImportStatus } from '@src/types/onyx';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import useWindowDimensions from '@hooks/useWindowDimensions';

type IntegrationSyncProgressProps = {
    /** The policy ID currently being configured */
    syncStatus: WorkspaceSingleIntegrationImportStatus;
};

function IntegrationSyncProgress({syncStatus}: IntegrationSyncProgressProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const {isSmallScreenWidth} = useWindowDimensions();
    // const {translate} = useLocalize();

    if (isClosed) {
        return null;
    }

    return (
        <Modal fullscreen={!isSmallScreenWidth} isVisible onClose={() => setIsClosed(true)} type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL} >
            <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                <Text style={styles.textLarge}>{syncStatus.percentage.toFixed(2)} %</Text>
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{syncStatus.status}</Text>
                {syncStatus.stagesCompleted.map(stateCompleted => 
                    <View style={styles.flexRow}>
                        <Text>{stateCompleted}</Text>
                        <Icon 
                            fill={theme.success}
                            src={Expensicons.Checkmark}
                        />
                    </View>
                )}
                <View style={styles.flexRow}>
                    <Text style={styles.textAlignCenter}>{syncStatus.status}</Text>
                    {syncStatus.status === 'progress' && <ActivityIndicator
                        color={theme.success}
                        size="small"
                    />}
                </View>
            </View>
        </Modal>
    );
}

IntegrationSyncProgress.displayName = 'IntegrationSyncProgress';

export default IntegrationSyncProgress;
