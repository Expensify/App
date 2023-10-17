import React from 'react';
import PropTypes from 'prop-types';
import * as Illustrations from '../Icon/Illustrations';
import Navigation from '../../libs/Navigation/Navigation';
import BlockingView from './BlockingView';
import useLocalize from '../../hooks/useLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Child elements */
    children: PropTypes.node.isRequired,

    ...windowDimensionsPropTypes,
};

function FullPageBiggerScreenView({isSmallScreenWidth, children}) {
    const {translate} = useLocalize();

    if (isSmallScreenWidth) {
        return (
            <BlockingView
                icon={Illustrations.BiggerScreen}
                title={translate('common.biggerScreenNeeded.title')}
                subtitle={translate('common.biggerScreenNeeded.subtitle')}
                linkKey="notFound.goBackHome"
                onLinkPress={Navigation.goBack}
                shouldShowLink
            />
        );
    }

    return children;
}

FullPageBiggerScreenView.propTypes = propTypes;
FullPageBiggerScreenView.displayName = 'FullPageBiggerScreenView';

export default withWindowDimensions(FullPageBiggerScreenView);
