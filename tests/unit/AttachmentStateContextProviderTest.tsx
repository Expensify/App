import {render} from '@testing-library/react-native';
import React, {useContext, useEffect} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';
import AttachmentStateContextProvider, {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';

type TestConsumerProps = {
    source: AttachmentSource;
    onLoadedState: (isLoaded: boolean) => void;
    loadedStateToSet?: boolean;
};

function TestConsumer({source, onLoadedState, loadedStateToSet}: TestConsumerProps) {
    const {isAttachmentLoaded, setAttachmentLoaded} = useContext(AttachmentStateContext);

    useEffect(() => {
        if (loadedStateToSet === undefined) {
            return;
        }
        setAttachmentLoaded(source, loadedStateToSet);
    }, [loadedStateToSet, setAttachmentLoaded, source]);

    useEffect(() => {
        onLoadedState(isAttachmentLoaded(source));
    }, [isAttachmentLoaded, onLoadedState, source]);

    return null;
}

describe('AttachmentStateContextProvider', () => {
    it('treats unknown attachments as not loaded until they explicitly load', () => {
        const source = 'https://invalid-url/image.jpg';
        const onLoadedState = jest.fn();
        const {rerender} = render(
            <AttachmentStateContextProvider>
                <TestConsumer
                    source={source}
                    onLoadedState={onLoadedState}
                />
            </AttachmentStateContextProvider>,
        );

        expect(onLoadedState).toHaveBeenLastCalledWith(false);

        rerender(
            <AttachmentStateContextProvider>
                <TestConsumer
                    source={source}
                    onLoadedState={onLoadedState}
                    loadedStateToSet
                />
            </AttachmentStateContextProvider>,
        );

        expect(onLoadedState).toHaveBeenLastCalledWith(true);
    });
});
