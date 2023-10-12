import React from 'react';
import RenderHTML from '../RenderHTML';
import menuItemRenderHTMLTitlePropTypes from './propTypes';

const propTypes = menuItemRenderHTMLTitlePropTypes;

const defaultProps = {};

function MenuItemRenderHTMLTitle(props) {
    return <RenderHTML html={props.title} />;
}

MenuItemRenderHTMLTitle.propTypes = propTypes;
MenuItemRenderHTMLTitle.defaultProps = defaultProps;
MenuItemRenderHTMLTitle.displayName = 'MenuItemRenderHTMLTitle';

export default MenuItemRenderHTMLTitle;
