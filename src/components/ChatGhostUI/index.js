import React from 'react';
import _ from 'underscore';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import ContentLoadingOneLine from './ContentLoadingElements/ContentLoadingOneLine';
import ContentLoadingTwoLines from './ContentLoadingElements/ContentLoadingTwoLines';
import ContentLoadingThreeLines from './ContentLoadingElements/ContentLoadingThreeLines';
import CONST from '../../CONST';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const ChatList = (props) => {
    const windowHeight = props.windowHeight;

    const height = CONST.CHAT_GHOST_ROW_HEIGHT;
    const numberOfRows = Math.floor(windowHeight / height);
    const contentItems = new Array(numberOfRows);

    return (
        <>
            {
                _.map(contentItems, (_item, index) => {
                    const iconIndex = (index + 1) % 4;
                    switch (iconIndex) {
                        case 2:
                            return <ContentLoadingTwoLines key={`ghostLoaderLines${index}`} />;
                        case 0:
                            return <ContentLoadingThreeLines key={`ghostLoaderLines${index}`} />;
                        default:
                            return <ContentLoadingOneLine key={`ghostLoaderLines${index}`} />;
                    }
                })
            }

        </>
    );
};

ChatList.displayName = 'ChatList';
ChatList.propTypes = propTypes;
export default withWindowDimensions(ChatList);
