import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

function WorkspaceCategoriesPage(props) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                icon={Illustrations.FolderOpen}
                title={props.translate('workspace.common.categories')}
                shouldShowBackButton={isSmallScreenWidth}
            />
        </ScreenWrapper>
    );
}

WorkspaceCategoriesPage.propTypes = propTypes;

export default compose(withLocalize, withWindowDimensions)(WorkspaceCategoriesPage);
