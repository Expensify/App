import React, {useState} from 'react';
import {View, Image} from 'react-native';
import {PortalHost, PortalProvider} from '@gorhom/portal';
import lodashGet from 'lodash/get';
import Text from '../components/Text';
import DragAndDrop from '../components/DragAndDrop';
import DropZone from '../components/DragAndDrop/DropZone';
import styles from '../styles/styles';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/DragAndDrop',
    component: DragAndDrop,
};

const Default = () => {
    const [draggingOver, setDraggingOver] = useState(false);

    const [fileUrl, setFileUrl] = useState('');

    return (
        <PortalProvider>
            {/* DragAndDrop does not need to render drop area as children since it is connected to it via id, which gives us flexibility to bring DragAndDrop where your
            draggingOver state is located */}
            <DragAndDrop
                dropZoneId="dropId"
                activeDropZoneId="activeDropZoneId"
                onDragEnter={() => {
                    setDraggingOver(true);
                }}
                onDragLeave={() => {
                    setDraggingOver(false);
                }}
                onDrop={(e) => {
                    const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                    if (file && file.type.includes('image')) {
                        setFileUrl(URL.createObjectURL(file));
                    }
                    setDraggingOver(false);
                }}
            >
                <View
                    style={[{
                        width: 200, height: 200, backgroundColor: 'beige', borderColor: 'black', borderWidth: 1,
                    }, styles.alignItemsCenter, styles.justifyContentCenter]}
                    nativeID="dropId"
                >
                    { fileUrl ? (
                        <Image
                            source={{uri: fileUrl}}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    ) : <Text color="black">Drop a picture here!</Text>}
                    {/* Portals give us flexibility to render active drag overlay regardless of your react component structure */}
                    <PortalHost name="portalHost" />
                </View>
            </DragAndDrop>
            {draggingOver && (
                <DropZone
                    dropZoneViewHolderName="portalHost"
                    dropZoneId="activeDropZoneId"
                />
            )}
        </PortalProvider>
    );
};

export default story;
export {
    Default,
};
