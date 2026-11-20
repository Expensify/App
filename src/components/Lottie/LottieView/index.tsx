/**
 * Web renderer for <Lottie>, built on dotLottie directly because lottie-react-native's web view doesn't let us pass the
 * render settings below, which keep the CPU cost of looping animations low on web.
 * See https://github.com/Expensify/App/issues/105079.
 */
import type {DotLottie} from '@lottiefiles/dotlottie-react';

import {DotLottieReact} from '@lottiefiles/dotlottie-react';
import {useEffect, useImperativeHandle, useState} from 'react';

import type {LottieViewProps} from './types';

// Most of our animations run at 24 fps, so interpolating a frame on every browser repaint (60 or 120 Hz) mostly
// redraws near-identical frames and was the biggest CPU cost on web.
const USE_FRAME_INTERPOLATION = false;

// Rendering at the screen's full pixel density multiplies the canvas size (4x on a 2x display) and its raster cost.
const RENDER_CONFIG = {devicePixelRatio: 1};

// Local assets resolve to a URL string on web, remote ones come as {uri}, and anything else is the animation JSON itself.
function getDotLottieSource(source: LottieViewProps['source']): {src?: string; data?: string} {
    if (typeof source === 'string') {
        return {src: source};
    }
    if ('uri' in source) {
        return {src: source.uri};
    }
    return {data: JSON.stringify(source)};
}

function LottieView({ref, source, speed, loop, webStyle, autoPlay, onAnimationFailure}: LottieViewProps) {
    const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

    useEffect(() => {
        if (!dotLottie) {
            return;
        }
        const handleLoadError = ({error}: {error: Error}) => onAnimationFailure?.(error.message);
        dotLottie.addEventListener('loadError', handleLoadError);
        return () => dotLottie.removeEventListener('loadError', handleLoadError);
    }, [dotLottie, onAnimationFailure]);

    useImperativeHandle(
        ref,
        () => ({
            play: () => dotLottie?.play(),
            pause: () => dotLottie?.pause(),
        }),
        [dotLottie],
    );

    const {src, data} = getDotLottieSource(source);

    return (
        <DotLottieReact
            dotLottieRefCallback={setDotLottie}
            src={src}
            data={data}
            style={webStyle}
            autoplay={autoPlay}
            speed={speed}
            loop={loop}
            useFrameInterpolation={USE_FRAME_INTERPOLATION}
            renderConfig={RENDER_CONFIG}
        />
    );
}

export default LottieView;
