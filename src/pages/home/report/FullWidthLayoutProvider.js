/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import {
    BaseLayoutProvider,
    WrapGridLayoutManager,
} from 'recyclerlistview';

class FullWidthLayoutManager extends WrapGridLayoutManager {
    getStyleOverridesForIndex() {
        return {width: '100%'};
    }
}

class FullWidthLayoutProvider extends BaseLayoutProvider {
    constructor(getLayoutTypeForIndex, setLayoutForType) {
        super();
        this._getLayoutTypeForIndex = getLayoutTypeForIndex;
        this._setLayoutForType = setLayoutForType;
        this._tempDim = {height: 0, width: 0};
        this._lastLayoutManager = null;
    }

    newLayoutManager(renderWindowSize, isHorizontal, cachedLayouts) {
        this._lastLayoutManager = new FullWidthLayoutManager(this, renderWindowSize, isHorizontal, cachedLayouts);
        return this._lastLayoutManager;
    }

    getLayoutTypeForIndex(index) {
        return this._getLayoutTypeForIndex(index);
    }

    setComputedLayout(type, dimension, index) {
        return this._setLayoutForType(type, dimension, index);
    }

    checkDimensionDiscrepancy(dimension, type, index) {
        const dimension1 = dimension;
        this.setComputedLayout(type, this._tempDim, index);
        const dimension2 = this._tempDim;
        if (this._lastLayoutManager) {
            this._lastLayoutManager.setMaxBounds(dimension2);
        }
        return dimension1.height !== dimension2.height || dimension1.width !== dimension2.width;
    }
}

export default FullWidthLayoutProvider;
