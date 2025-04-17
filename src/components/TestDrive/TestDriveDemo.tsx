import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import EmbeddedDemo from '@components/EmbeddedDemo';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import useEnvironment from '@hooks/useEnvironment';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {completeTestDriveTask} from '@libs/actions/Task';
import Navigation from '@libs/Navigation/Navigation';
import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';
import TestDriveBanner from './TestDriveBanner';

function TestDriveDemo() {
    const {environment} = useEnvironment();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsVisible(true);
            completeTestDriveTask();
        });
    }, []);

    const closeModal = useCallback(() => {
        setIsVisible(false);
        InteractionManager.runAfterInteractions(() => {
            Navigation.goBack();
        });
    }, []);

    return (
        <SafeAreaConsumer>
            {({paddingTop, paddingBottom}) => (
                <Modal
                    isVisible={isVisible}
                    onClose={closeModal}
                    type={CONST.MODAL.MODAL_TYPE.FULLSCREEN}
                    style={{backgroundColor: 'white'}}
                    innerContainerStyle={{flex: 1, marginTop: paddingTop, marginBottom: paddingBottom}}
                >
                    <TestDriveBanner onPress={closeModal} />
                    <FullPageOfflineBlockingView>
                        <EmbeddedDemo
                            url={getTestDriveURL(environment, shouldUseNarrowLayout)}
                            iframeTitle="Test Drive"
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            // iframeProps={{'data-navattic-demo-id': 'clzt21qk0000109l46k8tbtce'}}
                        />
                    </FullPageOfflineBlockingView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

TestDriveDemo.displayName = 'TestDriveDemo';

export default TestDriveDemo;
