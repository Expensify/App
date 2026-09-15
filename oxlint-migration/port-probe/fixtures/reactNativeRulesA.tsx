// reactNativeRulesBatch part A: the JSX-shape half of the native react/* parity batch.
// One violation per rule, each followed by a control that must stay quiet, so a row cannot pass just
// because the file always reports. Shapes that cannot type-check under fixtures/tsconfig.json live in
// reactNativeRulesC.jsx instead; everything here compiles.
import React, {useState} from 'react';

type ChildProps = {label: string; fsClass?: string};

export function Child({label}: ChildProps): React.JSX.Element {
    return <span>{label}</span>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Foo_bar(): React.JSX.Element {
    return <span>underscored</span>;
}

declare const items: string[];
declare const flagValue: boolean;
declare const condition: boolean;

// jsx-boolean-value ('never'): an explicit `={true}` is the violation.
export const explicitTrue = <Child label="a" {...{}} data-flag={true} />;
// control: the shorthand the rule asks for.
export const shorthandTrue = <Child label="a" data-flag />;

// jsx-fragments ('syntax'): the long form must be the shorthand.
export const longFragment = (
    <React.Fragment>
        <Child label="a" />
    </React.Fragment>
);
// control: the shorthand, with two children so it is not a useless fragment.
export const shortFragment = (
    <>
        <Child label="a" />
        <Child label="b" />
    </>
);

// jsx-no-comment-textnodes: a comment that renders as text.
export const commentTextNode = <div>// not a comment</div>;
// control: a real JSX comment.
export const realComment = <div>{/* a real comment */}</div>;

// jsx-no-script-url
export const scriptHref = <a href="javascript:void(0)">go</a>;
// control
export const plainHref = <a href="https://example.com">go</a>;

// jsx-no-target-blank (enforceDynamicLinks: 'always')
export const unsafeBlank = (
    <a href="https://example.com" target="_blank">
        go
    </a>
);
// control: rel closes the hole.
export const safeBlank = (
    <a href="https://example.com" target="_blank" rel="noreferrer">
        go
    </a>
);

// jsx-no-useless-fragment: a fragment wrapping a single child.
export const uselessFragment = (
    <>
        <Child label="a" />
    </>
);
// control: the child on its own.
export const noFragment = <Child label="a" />;

// jsx-pascal-case
export const underscoredComponent = <Foo_bar />;
// control
export const pascalComponent = <Child label="a" />;

// no-array-index-key
export const indexKeys = (
    <div>
        {items.map((item, index) => (
            <Child key={index} label={item} />
        ))}
    </div>
);
// control: a stable key.
export const stableKeys = (
    <div>
        {items.map((item) => (
            <Child key={item} label={item} />
        ))}
    </div>
);

// no-children-prop
export const childrenProp = <div children="text" />;
// control
export const childrenNested = <div>text</div>;

// no-danger
export const dangerous = <div dangerouslySetInnerHTML={{__html: '<b>x</b>'}} />;
// control
export const notDangerous = <div>{'<b>x</b>'}</div>;

// no-unescaped-entities: a bare apostrophe. `>` and `}` are on the rule's default list too, but both
// are TypeScript parse errors inside JSX text, so the apostrophe is the only shape that compiles.
export const unescaped = <div>Don't</div>;
// control
export const escaped = <div>{"Don't"}</div>;

// self-closing-comp
export const emptyNotSelfClosing = <div></div>;
// control
export const emptySelfClosing = <div />;

// forbid-component-props: fsClass is allowed only on the listed RN primitives.
export const forbiddenFsClass = <Child label="a" fsClass="x" />;
// control: the prop on nothing, since the allowedFor list is RN components this probe does not import.
export const noFsClass = <Child label="a" />;

// rules-of-hooks: a hook behind a condition.
export function ConditionalHook(): React.JSX.Element {
    if (condition) {
        const [value] = useState(0);
        return <div>{value}</div>;
    }
    return <div />;
}
// control: the hook at the top level.
export function UnconditionalHook(): React.JSX.Element {
    const [value] = useState(0);
    return <div>{flagValue ? value : 0}</div>;
}
