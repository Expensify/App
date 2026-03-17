import type {Meta} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import Text from '@components/Text';
import {defaultStyles} from '@src/styles';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof DragAndDropConsumer> = {
    title: 'Components/DragAndDrop',
    component: DragAndDropConsumer,
};

function Default() {
    const [fileURL, setFileURL] = useState('');

    return (
        <View
            style={[
                {
                    width: 500,
                    height: 500,
                    backgroundColor: 'beige',
                },
                defaultStyles.alignItemsCenter,
                defaultStyles.justifyContentCenter,
            ]}
        >
            <DragAndDropProvider>
                <View style={[defaultStyles.w100, defaultStyles.h100, defaultStyles.justifyContentCenter, defaultStyles.alignItemsCenter]}>
                    {fileURL ? (
                        <Image
                            source={{uri: fileURL}}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    ) : (
                        <Text color="black">Drop a picture here!</Text>
                    )}
                </View>
                <DragAndDropConsumer
                    onDrop={(event) => {
                        const file = event.dataTransfer?.files?.[0];
                        if (file?.type.includes('image')) {
                            const reader = new FileReader();
                            reader.addEventListener('load', () => setFileURL(reader.result as string));
                            reader.readAsDataURL(file);
                        }
                    }}
                >
                    <View style={[defaultStyles.w100, defaultStyles.h100, defaultStyles.alignItemsCenter, defaultStyles.justifyContentCenter, {backgroundColor: 'white'}]}>
                        <Text color="black">Release to upload file</Text>
                    </View>
                </DragAndDropConsumer>
            </DragAndDropProvider>
        </View>
    );
}

export default story;
export {Default};
