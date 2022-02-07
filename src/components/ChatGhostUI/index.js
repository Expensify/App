import React from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';
import ContentLoadingOneLine from './ContentLoadingElements/ContentLoadingOneLine';
import ContentLoadingTwoLines from './ContentLoadingElements/ContentLoadingTwoLines';
import ContentLoadingThreeLines from './ContentLoadingElements/ContentLoadingThreeLines';


const ChatList = () => {
    const windowHeight = Dimensions.get('window').height;

    const height = 80;
    const numberOfRows = Math.floor(windowHeight / height);
    const contentItems = Array.from({length: numberOfRows}, (v, i) => i);

    return (
        <>
            {
                _.map(contentItems, (item, index) => {
                    const iconIndex = (index + 1) % 4;
                    switch (iconIndex) {
                        case 2:
                            return <ContentLoadingTwoLines key={item} />;
                        case 0:
                            return <ContentLoadingThreeLines key={item} />;
                        default:
                            return <ContentLoadingOneLine key={item} />;
                    }
                })
            }

        </>
    );
};
export default ChatList;
