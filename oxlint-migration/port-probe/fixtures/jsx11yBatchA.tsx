import React from 'react';

// Plain DOM JSX -- no React Native. Every element sits on its own line so both tools anchor on the
// same line number: ESLint sometimes reports the attribute and oxlint the element, which only stays
// invisible while the whole opening tag is on one line.
// Part A covers the content and ARIA-attribute rules. Role and interaction rules are in jsx11yBatchB.tsx.
// Every component below pairs one violation with a valid control, so a rule that stops firing for a
// reason unrelated to the fixture (a dropped plugin, an option that silently disabled it) cannot pass
// by also silencing the violation.

// jsx-a11y/alt-text -- <img> with no alt; control carries alt.
function AltText() {
    return (
        <>
            <img src="logo.png" />
            <img src="logo.png" alt="Expensify logo" />
        </>
    );
}

// jsx-a11y/anchor-has-content -- empty anchor; control has text.
function AnchorHasContent() {
    return (
        <>
            <a href="/pricing" />
            <a href="/pricing">Pricing</a>
        </>
    );
}

// jsx-a11y/anchor-is-valid -- href="#" is the invalidHref aspect; control is a real href, and the
// Link control is what production's {components: ["Link"], specialLink: ["to"]} exists for.
function AnchorIsValid() {
    return (
        <>
            <a href="#">Learn more</a>
            <a href="/expenses">Expenses</a>
            <Link to="/reports">Reports</Link>
        </>
    );
}

// jsx-a11y/aria-activedescendant-has-tabindex -- aria-activedescendant without tabIndex; control
// uses -1, which the rule accepts and no-noninteractive-tabindex does not flag.
function AriaActiveDescendantHasTabindex() {
    return (
        <>
            <div aria-activedescendant="option-2" />
            <div aria-activedescendant="option-2" tabIndex={-1} />
        </>
    );
}

// jsx-a11y/aria-props -- misspelled ARIA attribute; control is spelled correctly.
function AriaProps() {
    return (
        <>
            <div aria-labeledby="summary" />
            <div aria-labelledby="summary" />
        </>
    );
}

// jsx-a11y/aria-proptypes -- "yes" is not a valid boolean value; control uses "true".
function AriaProptypes() {
    return (
        <>
            <div aria-hidden="yes" />
            <div aria-hidden="true" />
        </>
    );
}

// jsx-a11y/aria-role -- role="buttons" is not a role in aria-query; control is.
function AriaRole() {
    return (
        <>
            <div role="buttons" />
            <div role="button" tabIndex={0}>
                Save
            </div>
        </>
    );
}

// jsx-a11y/aria-unsupported-elements -- <meta> cannot carry ARIA at all; control has none.
function AriaUnsupportedElements() {
    return (
        <>
            <meta charset="utf-8" aria-hidden="false" />
            <meta charset="utf-8" />
        </>
    );
}

// jsx-a11y/control-has-associated-label -- empty <button>; control uses text content and, below it,
// production's labelAttributes: ["label"].
function ControlHasAssociatedLabel() {
    return (
        <>
            <button type="button" />
            <button type="button">Save</button>
            <button type="button" label="Save" />
        </>
    );
}

// jsx-a11y/heading-has-content -- empty heading; control has text.
function HeadingHasContent() {
    return (
        <>
            <h2 />
            <h2>Monthly spend</h2>
        </>
    );
}

// jsx-a11y/html-has-lang -- <html> whose lang is empty; control supplies one.
// lang="" and not a bare <html />, because the two engines disagree in opposite directions about the
// other shapes: oxlint's lang also fires when lang is missing or `undefined`, ESLint's lang also fires
// on lang={null} (it hands the literal to language-tags). An empty string is the only shape both
// tools agree belongs to lang as well as html-has-lang, so both entries simply claim it twice.
function HtmlHasLang() {
    return (
        <>
            <html lang="" />
            <html lang="en" />
        </>
    );
}

// jsx-a11y/iframe-has-title -- untitled iframe; control has a title.
function IframeHasTitle() {
    return (
        <>
            <iframe src="https://example.com/embed" />
            <iframe title="Bank statement" src="https://example.com/embed" />
        </>
    );
}

// jsx-a11y/img-redundant-alt -- alt repeats "photo", which screen readers announce anyway; control
// describes the picture without the redundant word.
function ImgRedundantAlt() {
    return (
        <>
            <img src="dog.png" alt="Photo of a dog" />
            <img src="dog.png" alt="Dog running through a field" />
        </>
    );
}

// jsx-a11y/label-has-associated-control -- label with neither htmlFor nor a nested control
// (production asserts "either"); control points at an id.
function LabelHasAssociatedControl() {
    return (
        <>
            <label>Username</label>
            <label htmlFor="username">Username</label>
        </>
    );
}

// jsx-a11y/lang -- "foo" is not a registered language tag; control is a well-formed one.
// This entry expects two findings, not one: the empty lang in HtmlHasLang above is invalid here too,
// on both tools. A boolean `lang` with no value is not used anywhere in this file because ESLint's
// rule throws on it (language-tags receives `true` and calls .trim).
function Lang() {
    return (
        <>
            <html lang="foo" />
            <html lang="en-US" />
        </>
    );
}

// jsx-a11y/media-has-caption -- video with no caption track; control nests track kind="captions".
function MediaHasCaption() {
    return (
        <>
            <video src="onboarding.mp4" />
            <video src="onboarding.mp4">
                <track kind="captions" src="onboarding.vtt" />
            </video>
        </>
    );
}

export default {
    AltText,
    AnchorHasContent,
    AnchorIsValid,
    AriaActiveDescendantHasTabindex,
    AriaProps,
    AriaProptypes,
    AriaRole,
    AriaUnsupportedElements,
    ControlHasAssociatedLabel,
    HeadingHasContent,
    HtmlHasLang,
    IframeHasTitle,
    ImgRedundantAlt,
    LabelHasAssociatedControl,
    Lang,
    MediaHasCaption,
};
