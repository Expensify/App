/**
 * Extract attribute key/value pairs from an embedded HTML component string.
 * Example: `<victorylabel lineheight="[1.2, 1.4]" style="[{fill: '#002E22'}]" />`
 */
function parseEmbeddedComponentAttributes(componentString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attributePattern = /([\w-]+)="([^"]*)"/g;
    let match = attributePattern.exec(componentString);
    while (match !== null) {
        attributes[match[1]] = match[2];
        match = attributePattern.exec(componentString);
    }
    return attributes;
}

export default parseEmbeddedComponentAttributes;
