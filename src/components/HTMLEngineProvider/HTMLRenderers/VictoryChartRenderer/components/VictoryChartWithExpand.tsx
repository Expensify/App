import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Modal from '@components/Modal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import VictoryChartContainer from './VictoryChartContainer';
import VictoryChartContent from './VictoryChartContent';
import IconButton from '@components/VideoPlayer/IconButton';

type VictoryChartWithExpandProps = {
    children: React.ReactNode;
};

function VictoryChartWithExpand({children}: VictoryChartWithExpandProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    const openFullScreen = useCallback(() => {
        setIsFullScreen(true);
    }, []);

    const closeFullScreen = useCallback(() => {
        setIsFullScreen(false);
    }, []);

    return (
        <>
            <View style={styles.pRelative}>
                {children}
                <IconButton
                    src={icons.Expand}
                    style={styles.videoExpandButton}
                    tooltipText={translate('common.expand')}
                    onPress={openFullScreen}
                    small
                    sentryLabel="Chart Expand Button"
                />
            </View>
            <Modal
                isVisible={isFullScreen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
                onClose={closeFullScreen}
            >
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <VictoryChartContainer>
                        <VictoryChartContent />
                    </VictoryChartContainer>
                </View>
            </Modal>
        </>
    );
}

VictoryChartWithExpand.displayName = 'VictoryChartWithExpand';

export default VictoryChartWithExpand;
