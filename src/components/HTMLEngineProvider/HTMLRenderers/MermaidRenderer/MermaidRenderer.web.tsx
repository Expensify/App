import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import {Minus, Plus} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type MermaidRendererProps = CustomRendererProps<TBlock> & {
    /** Key of the element */
    key?: string;
};

// Declare mermaid global type
declare global {
    interface Window {
        mermaid?: {
            initialize: (config: any) => void;
            render: (id: string, definition: string) => Promise<{svg: string}>;
        };
    }
}

/**
 * Web-specific Mermaid chart renderer component
 */
function MermaidRenderer({tnode, key}: MermaidRendererProps) {
    const styles = useThemeStyles();
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const zoomRef = useRef<ReactZoomPanPinchContentRef>(null);
    const [preferredSkinTone] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE});

    // Extract chart definition from the data attribute
    const chartData = tnode.attributes[CONST.MERMAID_CHART_ATTRIBUTE] as string;

    // Decode newline placeholders back to actual newlines
    const decodedChartData = chartData ? chartData.replace(/__MERMAID_NEWLINE__/g, '\n') : chartData;

    const theme = useMemo(() => {
        return preferredSkinTone === CONST.EMOJI_DEFAULT_SKIN_TONE ? 'default' : 'dark';
    }, [preferredSkinTone]);

    // Load Mermaid.js and render chart
    useEffect(() => {
        if (!decodedChartData) {
            return;
        }

        let isMounted = true; // Track if component is still mounted

        // Function to load Mermaid.js script
        const loadMermaid = () => {
            return new Promise<void>((resolve, reject) => {
                if (window.mermaid) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.7.0/dist/mermaid.min.js';
                script.onload = () => {
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load Mermaid.js'));
                };
                document.head.appendChild(script);
            });
        };

        // Render the chart
        const renderChart = async () => {
            try {
                await loadMermaid();
                
                if (!isMounted || !window.mermaid) {
                    return;
                }

                // Initialize Mermaid
                window.mermaid.initialize({
                    startOnLoad: false,
                    theme,
                    securityLevel: 'strict',
                    htmlLabels: true,
                    suppressErrorRendering: false,
                });

                // Generate unique ID for this chart
                const chartId = `mermaid-chart-${Math.random().toString(36).substr(2, 9)}`;
                
                // Render the chart
                const {svg} = await window.mermaid.render(chartId, decodedChartData);
                
                // Only update state if component is still mounted
                if (isMounted) {
                    setSvgContent(svg);
                    setIsLoaded(true);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Mermaid rendering error:', err);
                    setError(err instanceof Error ? err.message : 'Failed to render chart');
                    setIsLoaded(false);
                }
            }
        };

        renderChart();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [decodedChartData, theme]);

    const handleZoomIn = () => {
        zoomRef.current?.zoomIn();
        setIsZoomed(true);
    };

    const handleZoomOut = () => {
        zoomRef.current?.zoomOut();
    };

    const handleResetZoom = () => {
        zoomRef.current?.resetTransform();
        setIsZoomed(false);
    };

    if (!decodedChartData) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.p4]}>
                <Text style={styles.textSupporting}>Unable to display chart</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.p4]}>
                <Text style={[styles.textSupporting, {color: 'red'}]}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.p2]}>
            <View style={[styles.flexRow, styles.mb2, styles.gap2]}>
                <Button
                    small
                    onPress={handleZoomIn}
                    icon={Plus}
                    text="Zoom In"
                />
                <Button
                    small
                    onPress={handleZoomOut}
                    icon={Minus}
                    text="Zoom Out"
                />
                <Button
                    small
                    onPress={handleResetZoom}
                    text="Reset"
                />
            </View>
            <TransformWrapper
                ref={zoomRef}
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                wheel={{
                    step: 0.1,
                }}
            >
                <TransformComponent>
                    {isLoaded && svgContent ? (
                        <div
                            style={{
                                minHeight: 'auto',
                                minWidth: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                            }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    ) : (
                        <div
                            style={{
                                minHeight: '200px',
                                minWidth: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                            }}
                        >
                            {!error && <Text style={styles.textSupporting}>Loading chart...</Text>}
                        </div>
                    )}
                </TransformComponent>
            </TransformWrapper>
        </View>
    );
}

MermaidRenderer.displayName = 'MermaidRenderer';

export default MermaidRenderer; 