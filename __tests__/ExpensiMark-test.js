/* eslint-disable max-len */
import ExpensiMark from '../src/lib/ExpensiMark';

const parser = new ExpensiMark();

// Words wrapped in * successfully replaced with <strong></strong>
test('Test bold markdown replacement', () => {
    const boldTestStartString = 'This is a *sentence,* and it has some *punctuation, words, and spaces*. '
        + '*test* * testing* test*test*test.';
    const boldTestReplacedString = 'This is a <strong>sentence,</strong> and it has some <strong>punctuation, words, and spaces</strong>. '
        + '<strong>test</strong> <strong> testing</strong> test*test*test.';

    expect(parser.replace(boldTestStartString)).toBe(boldTestReplacedString);
});

// Words wrapped in _ successfully replaced with <em></em>
test('Test italic markdown replacement', () => {
    const italicTestStartString = 'This is a _sentence,_ and it has some _punctuation, words, and spaces_. _test_ _ testing_ test_test_test.';
    const italicTestReplacedString = 'This is a <em>sentence,</em> and it has some <em>punctuation, words, and spaces</em>. <em>test</em> <em> testing</em> test_test_test.';
    expect(parser.replace(italicTestStartString)).toBe(italicTestReplacedString);
});

// Words wrapped in ~ successfully replaced with <del></del>
test('Test strikethrough markdown replacement', () => {
    const strikethroughTestStartString = 'This is a ~sentence,~ and it has some ~punctuation, words, and spaces~. ~test~ ~ testing~ test~test~test.';
    const strikethroughTestReplacedString = 'This is a <del>sentence,</del> and it has some <del>punctuation, words, and spaces</del>. <del>test</del> <del> testing</del> test~test~test.';
    expect(parser.replace(strikethroughTestStartString)).toBe(strikethroughTestReplacedString);
});

// Markdown style links replaced successfully
test('Test markdown style links', () => {
    const testString = 'Go to [Expensify](https://www.expensify.com) to learn more.';
    const resultString = 'Go to <a href="https://www.expensify.com" target="_blank">Expensify</a> to learn more.';
    expect(parser.replace(testString)).toBe(resultString);
});

// HTML encoded strings unaffected by parser
test('Test HTML encoded strings', () => {
    const rawHTMLTestStartString = '<em>This is</em> a <strong>test</strong>. None of <h1>these strings</h1> should display <del>as</del> <div>HTML</div>.';
    const rawHTMLTestReplacedString = '&lt;em&gt;This is&lt;/em&gt; a &lt;strong&gt;test&lt;/strong&gt;. None of &lt;h1&gt;these strings&lt;/h1&gt; should display &lt;del&gt;as&lt;/del&gt; &lt;div&gt;HTML&lt;/div&gt;.';
    expect(parser.replace(rawHTMLTestStartString)).toBe(rawHTMLTestReplacedString);
});

// New lines characters \\n were successfully replaced with <br>
test('Test newline markdown replacement', () => {
    const newLineTestStartString = 'This sentence has a newline \n Yep just had one \n Oh there it is another one';
    const newLineReplacedString = 'This sentence has a newline <br> Yep just had one <br> Oh there it is another one';
    expect(parser.replace(newLineTestStartString)).toBe(newLineReplacedString);
});

// Period replacement test
test('Test period replacements', () => {
    const periodTestStartString = 'This test ensures that words with trailing... periods.. are. not converted to links. Also, words seperated.by.periods should...not become..links.';
    expect(parser.replace(periodTestStartString)).toBe(periodTestStartString);
});

test('Test code fencing', () => {
    const codeFenceExampleMarkdown = '```\nconst javaScript = \'javaScript\'\n```';
    expect(parser.replace(codeFenceExampleMarkdown)).toBe('<pre>const&nbsp;javaScript&nbsp;=&nbsp;&#x27;javaScript&#x27;</pre>');
});

test('Test code fencing with spaces and new lines', () => {
    const codeFenceExample = '```\nconst javaScript = \'javaScript\'\n    const php = \'php\'\n```';
    expect(parser.replace(codeFenceExample)).toBe('<pre>const&nbsp;javaScript&nbsp;=&nbsp;&#x27;javaScript&#x27;<br>&nbsp;&nbsp;&nbsp;&nbsp;const&nbsp;php&nbsp;=&nbsp;&#x27;php&#x27;</pre>');
});

test('Test inline code blocks', () => {
    const inlineCodeStartString = 'My favorite language is `JavaScript`. How about you?';
    expect(parser.replace(inlineCodeStartString)).toBe('My favorite language is <code>JavaScript</code>. How about you?');
});

test('Test code fencing with ExpensiMark syntax inside', () => {
    const codeFenceExample = '```\nThis is how you can write ~strikethrough~, *bold*, _italics_, and [links](https://www.expensify.com)\n```';
    expect(parser.replace(codeFenceExample)).toBe('<pre>This&nbsp;is&nbsp;how&nbsp;you&nbsp;can&nbsp;write&nbsp;~strikethrough~,&nbsp;*bold*,&nbsp;_italics_,&nbsp;and&nbsp;[links](https://www.expensify.com)</pre>');
});

test('Test combination replacements', () => {
    const urlTestStartString = '<em>Here</em> is a _combination test_ that <marquee>sees</marquee> if ~https://www.example.com~ https://otherexample.com links get rendered first followed by *other markup* or if _*two work together*_ as well. This sentence also has a newline \n Yep just had one.';
    const urlTestReplacedString = '&lt;em&gt;Here&lt;/em&gt; is a <em>combination test</em> that &lt;marquee&gt;sees&lt;/marquee&gt; if <del><a href="https://www.example.com" target="_blank">https://www.example.com</a></del> <a href="https://otherexample.com"'
        + ' target="_blank">https://otherexample.com</a> links get rendered first followed by <strong>other markup</strong> or if <em><strong>two work together</strong></em> as well. This sentence also has a newline <br> Yep just had one.';
    expect(parser.replace(urlTestStartString)).toBe(urlTestReplacedString);
});

test('Test wrapped URLs', () => {
    const wrappedUrlTestStartString = '~https://www.example.com~ _http://www.test.com_ *http://www.asdf.com/_test*';
    const wrappedUrlTestReplacedString = '<del><a href="https://www.example.com" target="_blank">https://www.example.com</a></del> <em><a href="http://www.test.com" target="_blank">http://www.test.com</a></em>'
    + ' <strong><a href="http://www.asdf.com/_test" target="_blank">http://www.asdf.com/_test</a></strong>';
    expect(parser.replace(wrappedUrlTestStartString)).toBe(wrappedUrlTestReplacedString);
});

test('Test url replacements', () => {
    const urlTestStartString = 'Testing '
        + 'test.com '
        + 'test again '
        + 'http://test.com/test '
        + 'www.test.com '
        + 'https://www.test.com '
        + 'http://test.com)';

    const urlTestReplacedString = 'Testing '
        + 'test.com '
        + 'test again '
        + '<a href="http://test.com/test" target="_blank">http://test.com/test</a> '
        + '<a href="www.test.com" target="_blank">www.test.com</a> '
        + '<a href="https://www.test.com" target="_blank">https://www.test.com</a> '
        + '<a href="http://test.com" target="_blank">http://test.com</a>)';

    expect(parser.replace(urlTestStartString)).toBe(urlTestReplacedString);
});

test('Test markdown style link with various styles', () => {
    const testString = 'Go to ~[Expensify](https://www.expensify.com)~ '
        + '_[Expensify](https://www.expensify.com)_ '
        + '*[Expensify](https://www.expensify.com)* '
        + '[Expensify!](https://www.expensify.com) '
        + '[Expensify?](https://www.expensify.com) '
        + '[Expensify](https://www.expensify-test.com) '
        + '[Expensify](https://www.expensify.com/settings?param={%22section%22:%22account%22})';

    const resultString = 'Go to <del><a href="https://www.expensify.com" target="_blank">Expensify</a></del> '
        + '<em><a href="https://www.expensify.com" target="_blank">Expensify</a></em> '
        + '<strong><a href="https://www.expensify.com" target="_blank">Expensify</a></strong> '
        + '<a href="https://www.expensify.com" target="_blank">Expensify!</a> '
        + '<a href="https://www.expensify.com" target="_blank">Expensify?</a> '
        + '<a href="https://www.expensify-test.com" target="_blank">Expensify</a> '
        + '<a href="https://www.expensify.com/settings?param={%22section%22:%22account%22}" target="_blank">Expensify</a>';

    expect(parser.replace(testString)).toBe(resultString);
});
