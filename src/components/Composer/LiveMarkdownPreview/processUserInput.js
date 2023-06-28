import ExpensiMark from '../vendor/expensify-common/lib/ExpensiMark';

const parser = new ExpensiMark();
export const processUserInput = aztecInputString => {
  const foundParagraphs = aztecInputString.match(/<p>(.*?)<\/p>/g);

  let paragraphs = foundParagraphs || [];

  const getMarkdownChar = char => `<span>${char}</span>`;

  const MarkdownSyntax = {
    bold: getMarkdownChar('*'),
    italic: getMarkdownChar('_'),
    inlineCode: getMarkdownChar('`'),
    header1: getMarkdownChar('#'),
  };

  const rules = [
    [MarkdownSyntax.bold, 'strong', true],
    [MarkdownSyntax.italic, 'em', true],
    [MarkdownSyntax.inlineCode, 'code', true],
    [MarkdownSyntax.header1, 'h1'],
  ];

  // Apply markdown rules to each paragraph
  paragraphs = paragraphs.map(paragraph => {
    let processedParagraph = paragraph;
    processedParagraph = parser.htmlToText(paragraph);

    processedParagraph = parser.replace(processedParagraph);

    rules.forEach(([markdownChar, htmlTag, surround]) => {
      processedParagraph = processedParagraph.replace(
          new RegExp(`<${htmlTag}>(.*?)<\/${htmlTag}>`, 'g'),
          (match, p1) => {
            if (p1.startsWith(markdownChar) && p1.endsWith(markdownChar)) {
              return match;
            }
            const replacement = surround
                ? `${markdownChar}${p1}${markdownChar}`
                : `${markdownChar} ${p1}`;

            return `<${htmlTag}>${replacement}</${htmlTag}>`;
          },
      );
    });

    return `<p>${processedParagraph}</p>`;
  });

  let processedHtml = paragraphs.join('');

  return processedHtml;
};
