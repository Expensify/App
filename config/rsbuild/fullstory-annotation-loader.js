/**
 * Lightweight webpack loader that replicates @fullstory/babel-plugin-annotate-react
 * (native: true mode) without running the full Babel transform pipeline.
 *
 * Uses @babel/parser for AST parsing (syntax-only, no code transforms), then
 * @babel/traverse to locate React component functions and inject dataComponent /
 * dataElement / dataSourceFile props onto JSX opening elements, then
 * @babel/generator to emit annotated source that still contains JSX.
 *
 * This runs as the FIRST webpack loader (rightmost in use[]) so OXC receives
 * annotated JSX and can run its own React Compiler before the JSX transform.
 *
 * Ported from:
 * https://github.com/fullstorydev/fullstory-babel-plugin-annotate-react/blob/master/index.js
 * Supports `native: true` mode only (matches the existing webpack config).
 */

'use strict';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Modules known to be incompatible with Fullstory annotation (from upstream plugin)
const KNOWN_INCOMPATIBLE = [
    'react-native-testfairy',
    '@react-navigation',
    'react-native-navigation',
    'expo-router',
    'victory',
    'victory-area',
    'victory-axis',
    'victory-bar',
    'victory-box-plot',
    'victory-brush-container',
    'victory-brush-line',
    'victory-candlestick',
    'victory-canvas',
    'victory-chart',
    'victory-core',
    'victory-create-container',
    'victory-cursor-container',
    'victory-errorbar',
    'victory-group',
    'victory-histogram',
    'victory-legend',
    'victory-line',
    'victory-native',
    'victory-pie',
    'victory-polar-axis',
    'victory-scatter',
    'victory-selection-container',
    'victory-shared-events',
    'victory-stack',
    'victory-tooltip',
    'victory-vendor',
    'victory-voronoi',
    'victory-voronoi-container',
    'victory-zoom-container',
];

// Attribute names for native: true mode
const ATTR_COMPONENT = 'dataComponent';
const ATTR_ELEMENT = 'dataElement';
const ATTR_SOURCE_FILE = 'dataSourceFile';

// HTML element names that should NOT get a dataElement attribute
const IGNORED_HTML_ELEMENTS = new Set([
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'keygen',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'menu',
    'menuitem',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'pre',
    'progress',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
]);

function hasAttribute(openingElement, name) {
    return (openingElement.attributes || []).some((attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, {name}));
}

function isFragment(openingElement) {
    if (!openingElement || !openingElement.name) return false;
    const name = openingElement.name;
    if (t.isJSXIdentifier(name, {name: 'Fragment'}) || t.isJSXIdentifier(name, {name: 'React.Fragment'})) return true;
    if (t.isJSXMemberExpression(name)) {
        return t.isJSXIdentifier(name.object, {name: 'React'}) && t.isJSXIdentifier(name.property, {name: 'Fragment'});
    }
    return false;
}

function addAttribute(openingElement, attrName, value) {
    if (!openingElement || isFragment(openingElement) || hasAttribute(openingElement, attrName)) return;
    openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier(attrName), t.stringLiteral(value)));
}

function annotateJSXNode(jsxPath, componentName, sourceFileName) {
    const openingEl = jsxPath.node.openingElement;
    if (!openingEl || isFragment(openingEl)) return;

    const elementName = t.isJSXIdentifier(openingEl.name) ? openingEl.name.name : 'unknown';

    // dataElement — skip for HTML primitives
    if (!IGNORED_HTML_ELEMENTS.has(elementName) && !hasAttribute(openingEl, ATTR_ELEMENT)) {
        openingEl.attributes.push(t.jSXAttribute(t.jSXIdentifier(ATTR_ELEMENT), t.stringLiteral(elementName)));
    }

    // dataComponent — only for root element of a component
    if (componentName) addAttribute(openingEl, ATTR_COMPONENT, componentName);

    // dataSourceFile
    if (sourceFileName) addAttribute(openingEl, ATTR_SOURCE_FILE, sourceFileName);

    // Recurse into children (they get dataElement + dataSourceFile, but not dataComponent)
    for (const child of jsxPath.get('children')) {
        if (child.isJSXElement()) {
            annotateJSXNode(child, null, sourceFileName);
        }
    }
}

function annotateComponent(funcPath, componentName, sourceFileName) {
    // Find the top-level JSX return in the function body
    let jsxPath = null;

    const body = funcPath.get('body');
    if (!body.isBlockStatement()) {
        // Arrow with expression body: `() => <Foo />`
        if (body.isJSXElement() || body.isJSXFragment()) jsxPath = body;
    } else {
        const stmts = body.get('body');
        const returnStmt = stmts.find((s) => s.isReturnStatement());
        if (returnStmt) {
            const arg = returnStmt.get('argument');
            if (arg.isJSXElement() || arg.isJSXFragment()) jsxPath = arg;
        }
    }

    if (!jsxPath) return;
    annotateJSXNode(jsxPath, componentName, sourceFileName);
}

module.exports = function fullstoryAnnotationLoader(source) {
    const resourcePath = this.resourcePath;

    // Skip known-incompatible node_modules
    if (KNOWN_INCOMPATIBLE.some((m) => resourcePath.includes(`/node_modules/${m}/`) || resourcePath.includes(`\\node_modules\\${m}\\`))) {
        return source;
    }

    // Only process files that likely contain JSX
    if (!/\.(jsx|tsx|js|ts)$/.test(resourcePath)) return source;

    const sourceFileName = resourcePath.split('/').pop();

    let ast;
    try {
        ast = parser.parse(source, {
            sourceType: 'module',
            // Parse-only — no code generation; plugins enable syntax understanding
            plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'optionalChaining', 'nullishCoalescingOperator'],
            strictMode: false,
        });
    } catch {
        // If parsing fails, pass through unchanged — OXC will surface the real error
        return source;
    }

    let modified = false;

    traverse(ast, {
        FunctionDeclaration(path) {
            const name = path.node.id && path.node.id.name;
            if (!name) return;
            const before = JSON.stringify(path.node);
            annotateComponent(path, name, sourceFileName);
            if (JSON.stringify(path.node) !== before) modified = true;
        },
        ArrowFunctionExpression(path) {
            const parent = path.parent;
            const name = t.isVariableDeclarator(parent) && t.isIdentifier(parent.id) ? parent.id.name : null;
            if (!name) return;
            const before = JSON.stringify(path.node);
            annotateComponent(path, name, sourceFileName);
            if (JSON.stringify(path.node) !== before) modified = true;
        },
        ClassDeclaration(path) {
            const name = path.node.id && path.node.id.name;
            if (!name) return;
            path.get('body')
                .get('body')
                .forEach((member) => {
                    if (!member.isClassMethod()) return;
                    if (!t.isIdentifier(member.node.key, {name: 'render'})) return;
                    member
                        .get('body')
                        .get('body')
                        .forEach((stmt) => {
                            if (!stmt.isReturnStatement()) return;
                            const arg = stmt.get('argument');
                            if (!arg.isJSXElement() && !arg.isJSXFragment()) return;
                            const before = JSON.stringify(arg.node);
                            annotateJSXNode(arg, name, sourceFileName);
                            if (JSON.stringify(arg.node) !== before) modified = true;
                        });
                });
        },
    });

    if (!modified) return source;

    const {code, map} = generate(ast, {sourceMaps: !!this.sourceMap, sourceFileName: resourcePath}, source);

    if (this.sourceMap && map) {
        this.callback(null, code, map);
        return;
    }

    return code;
};
