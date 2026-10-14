import type {SvgProps} from 'react-native-svg';

import React, {useId} from 'react';
import Svg, {Defs, G, LinearGradient, Path, RadialGradient, Stop} from 'react-native-svg';

// Static SVGs reuse gradient IDs on web. When another copy is hidden, the browser can resolve this icon's gradients
// to that copy and not draw them. This component gives each render its own gradient IDs.
function BusinessCentralSquare(props: SvgProps) {
    const id = useId();
    return (
        <Svg
            width={40}
            height={40}
            fill="none"
            viewBox="0 0 40 40"
            {...props}
        >
            <Path
                fill="#1e304f"
                d="M0 0h40v40H0z"
            />
            <G transform="translate(6 6) scale(.29167)">
                <Path
                    fill={`url(#${id}-topFill)`}
                    d="M34 34c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-topShade)`}
                    d="M34 34c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-topEdge)`}
                    d="M34 34c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-bottomFill)`}
                    d="M62 62c-7.732-7.732-20.268-7.732-28 0s-7.732 20.268 0 28 20.268 7.732 28 0 7.732-20.268 0-28"
                />
                <Path
                    fill={`url(#${id}-bottomEdge)`}
                    d="M62 62c-7.732-7.732-20.268-7.732-28 0s-7.732 20.268 0 28 20.268 7.732 28 0 7.732-20.268 0-28"
                />
                <Path
                    fill={`url(#${id}-bottomShade)`}
                    d="M62 62c-7.732-7.732-20.268-7.732-28 0s-7.732 20.268 0 28 20.268 7.732 28 0 7.732-20.268 0-28"
                />
                <Path
                    fill={`url(#${id}-centerFill)`}
                    d="M34 62c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-centerShadeRight)`}
                    d="M34 62c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-centerShadeLeft)`}
                    d="M34 62c7.732 7.732 20.268 7.732 28 0s7.732-20.268 0-28-20.268-7.732-28 0-7.732 20.268 0 28"
                />
                <Path
                    fill={`url(#${id}-leftFill)`}
                    d="M6 34 34 6c-7.732 7.732-7.732 20.268 0 28s7.732 20.268 0 28-20.268 7.732-28 0-7.732-20.268 0-28"
                />
                <Path
                    fill={`url(#${id}-leftShade)`}
                    d="M6 34 34 6c-7.732 7.732-7.732 20.268 0 28s7.732 20.268 0 28-20.268 7.732-28 0-7.732-20.268 0-28"
                />
                <Path
                    fill={`url(#${id}-rightFill)`}
                    d="M90 62 62 90c7.732-7.732 7.732-20.268 0-28s-7.732-20.268 0-28 20.268-7.732 28 0 7.732 20.268 0 28"
                />
                <Defs>
                    <LinearGradient
                        id={`${id}-topFill`}
                        x1="30"
                        x2="67"
                        y1="9.5"
                        y2="25"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop stopColor="#0c74a1" />
                        <Stop
                            offset=".468"
                            stopColor="#1384b1"
                        />
                        <Stop
                            offset="1"
                            stopColor="#16bbda"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-topEdge`}
                        x1="49"
                        x2="26.5"
                        y1="14"
                        y2="24"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            stopColor="#1384b1"
                            stopOpacity="0"
                        />
                        <Stop
                            offset="1"
                            stopColor="#004695"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-bottomFill`}
                        x1="68.5"
                        x2="29"
                        y1="79.5"
                        y2="71"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop stopColor="#06517b" />
                        <Stop
                            offset=".509"
                            stopColor="#09638e"
                        />
                        <Stop
                            offset="1"
                            stopColor="#0c74a1"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-bottomEdge`}
                        x1="53"
                        x2="69.5"
                        y1="76"
                        y2="72"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            stopColor="#09638e"
                            stopOpacity="0"
                        />
                        <Stop
                            offset="1"
                            stopColor="#003580"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-centerFill`}
                        x1="44.5"
                        x2="45"
                        y1="29.5"
                        y2="68.5"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop stopColor="#43e5ca" />
                        <Stop
                            offset=".372"
                            stopColor="#26cfe8"
                        />
                        <Stop
                            offset="1"
                            stopColor="#1384b1"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-leftFill`}
                        x1="14.5"
                        x2="43.5"
                        y1="26"
                        y2="55"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop stopColor="#b6f6c7" />
                        <Stop
                            offset=".278"
                            stopColor="#43e5ca"
                        />
                        <Stop
                            offset="1"
                            stopColor="#26cfe8"
                        />
                    </LinearGradient>
                    <LinearGradient
                        id={`${id}-rightFill`}
                        x1="63"
                        x2="92.5"
                        y1="30"
                        y2="59.5"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop stopColor="#9ff2e4" />
                        <Stop
                            offset=".266"
                            stopColor="#2bdabe"
                        />
                        <Stop
                            offset=".621"
                            stopColor="#16bbda"
                        />
                        <Stop
                            offset="1"
                            stopColor="#1384b1"
                        />
                    </LinearGradient>
                    <RadialGradient
                        id={`${id}-topShade`}
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform="rotate(-90 48 0) scale(29.5)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset=".456"
                            stopColor="#0057aa"
                        />
                        <Stop
                            offset="1"
                            stopColor="#1384b1"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                    <RadialGradient
                        id={`${id}-bottomShade`}
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform="rotate(90 0 48) scale(36)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset=".423"
                            stopColor="#003580"
                        />
                        <Stop
                            offset="1"
                            stopColor="#09638e"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                    <RadialGradient
                        id={`${id}-centerShadeRight`}
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform="matrix(0 32 -32 0 76 48)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset=".4"
                            stopColor="#09638e"
                        />
                        <Stop
                            offset="1"
                            stopColor="#119fc5"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                    <RadialGradient
                        id={`${id}-centerShadeLeft`}
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform="matrix(0 34 -34 0 20 48)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset=".4"
                            stopColor="#09638e"
                        />
                        <Stop
                            offset="1"
                            stopColor="#119fc5"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                    <RadialGradient
                        id={`${id}-leftShade`}
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform="matrix(18.50004 40.5 -40.76334 18.62033 11.5 26)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset=".585"
                            stopColor="#2bdabe"
                            stopOpacity="0"
                        />
                        <Stop
                            offset="1"
                            stopColor="#119fc5"
                        />
                    </RadialGradient>
                </Defs>
            </G>
        </Svg>
    );
}

export default BusinessCentralSquare;
