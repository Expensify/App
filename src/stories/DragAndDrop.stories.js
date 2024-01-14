import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import Text from '@components/Text';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
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
                    onDrop={(e) => {
                        const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                        if (file && file.type.includes('image')) {
                            const reader = new FileReader();
                            reader.addEventListener('load', () => setFileURL(reader.result));
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
