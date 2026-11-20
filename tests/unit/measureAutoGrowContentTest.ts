import measureAutoGrowContentWeb from '@libs/measureAutoGrowContent/index.web';

import type {View} from 'react-native';

describe('measureAutoGrowContent on web', () => {
    it('reports the content height synchronously', () => {
        // Given a rendered content node, which react-native-web exposes as the DOM element itself
        const content = document.createElement('div');
        Object.defineProperty(content, 'offsetHeight', {value: 420});
        const callback = jest.fn();

        // When the auto-grow container measures it inside its layout effect
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web hands the ref over as the DOM element, so a div stands in for the View here
        measureAutoGrowContentWeb(content as unknown as View, callback);

        // Then the height arrives before the function returns, so the one-row probe render never reaches a painted frame
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(420);
    });

    it('does nothing before the content is mounted', () => {
        // Given the content ref has not been attached yet
        const callback = jest.fn();

        // When the container tries to measure it
        measureAutoGrowContentWeb(null, callback);

        // Then no height is reported, so the container keeps its current cap
        expect(callback).not.toHaveBeenCalled();
    });
});
