import React from 'react';
import {Dimensions} from 'react-native';
import ContentLoader from 'react-content-loader';
import _ from 'underscore';


const ChatList = (props) => {
    const windowHeight = Dimensions.get('window').height;

    const height = 140;
    const numberOfRows = Math.floor(windowHeight / height);
    const contentItems = Array.from({length: numberOfRows}, (v, i) => i);

    return (
        <>
            {
                _.map(contentItems, item => (
                    <ContentLoader height={height} width="100%" key={item} {...props}>
                        <circle cx="50" cy="70" r="30" />
                        <rect x="100" y="64.7" width="30%" height="17" />
                        <rect x="100" y="29.5" width="85%" height="17" />
                        <rect x="100" y="97.8" width="60%" height="16" />
                    </ContentLoader>
                ))
            }
        </>
    );
};
export default ChatList;
