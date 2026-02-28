import React, {useImperativeHandle, useRef} from 'react';
import type {View as RNView} from 'react-native';
import variables from '@styles/variables';
import type {AvatarCaptureProps} from './types';

/**
 * Web implementation of AvatarCapture using HTML Canvas
 */
function AvatarCapture({children, fileName: name, ref}: AvatarCaptureProps) {
    const containerRef = useRef<RNView>(null);

    useImperativeHandle(
        ref,
        () => ({
            capture: () =>
                new Promise<File>((resolve, reject) => {
                    const container = containerRef.current as unknown as HTMLElement;
                    if (!container) {
                        reject(new Error('Container ref not available'));
                        return;
                    }

                    // Find the colored avatar container
                    const coloredAvatarElement = container.querySelector('[data-id="colored-avatar"]');
                    if (!coloredAvatarElement) {
                        reject(new Error('Colored avatar element not found'));
                        return;
                    }

                    // Get the SVG element and styles
                    const svgElement = coloredAvatarElement.querySelector('svg');
                    if (!svgElement) {
                        reject(new Error('No SVG element found'));
                        return;
                    }

                    // Get dimensions and background color
                    const width = variables.avatarSizeXXLarge;
                    const height = variables.avatarSizeXXLarge;
                    const backgroundColor = globalThis.getComputedStyle(coloredAvatarElement).backgroundColor;

                    // Create canvas with 2x resolution for better quality
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    // Draw circular background
                    ctx.fillStyle = backgroundColor;
                    ctx.beginPath();
                    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
                    ctx.fill();

                    // Serialize and draw the SVG
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                    const url = URL.createObjectURL(svgBlob);

                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, width, height);
                        URL.revokeObjectURL(url);

                        // Convert canvas to file
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error('Failed to create blob from canvas'));
                                return;
                            }

                            const file = new File([blob], `${name}.png`, {type: 'image/png'});
                            Object.defineProperty(file, 'uri', {
                                value: URL.createObjectURL(blob),
                                writable: false,
                            });

                            resolve(file);
                        }, 'image/png');
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(url);
                        reject(new Error('Failed to load SVG'));
                    };

                    img.src = url;
                }),
        }),
        [name],
    );

    return <div ref={containerRef as unknown as React.RefObject<HTMLDivElement>}>{children}</div>;
}

export default AvatarCapture;
