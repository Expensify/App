import React, {useState} from 'react';
import {View, Image} from 'react-native';
import lodashGet from 'lodash/get';
import Text from '../components/Text';
import DragAndDropProvider from '../components/DragAndDrop/Provider';
import DragAndDropConsumer from '../components/DragAndDrop/Consumer';
import styles from '../styles/styles';

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
                styles.alignItemsCenter,
                styles.justifyContentCenter,
            ]}
        >
            <DragAndDropProvider>
                <View style={[styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
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
                    <View style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter, {backgroundColor: 'white'}]}>
                        <Text color="black">Release to upload file</Text>
                    </View>
                </DragAndDropConsumer>
            </DragAndDropProvider>
        </View>
    );
}

export default story;
export {Default};
