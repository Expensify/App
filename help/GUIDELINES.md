Please make the fewest changes to update this file to comply with the following rules:

# Philosophy
In general, this help site is built around a few common principles:

* **Consistency** - Every page of the site should follow a common pattern, as should every chapter on the page, and every section in the chapter
* **Focus** - Every section should focus as much as possible on a single self-contained subset of the page, with complex subsets being broken into section groups rather than large singular sections
* **Plain language** - All writing should target a 6th grade reading level, with very common language and simple phrasings.


# Structure Rules
To avoid ambiguity, let's establish the following terms:

* **Site** - All of the pages combine to create a single help "site" providing comprehensive details on the Expensify Superapp, which is a collection of multiple products combined into a single app.

* **Page** - Each help "page" is devoted to a single product within a tightly integrated suite.  Accordingly, while each product page can refer to other products, each product page should only provide detailed definitions on a single product to avoid redundancy between product pages.  Each product is split into multiple 

* **Chapter** - Each page is split into a standard set of "chapters", each of which contains multiple sections.

* **Section** - Each chapter has three or more "sections", consisting of a header and body.
[Fr
* **Header** - Each section has a "header", which describes the contents of that section.

* **Body* - Each section has a "body", which contains the contents of that section.


# Chapter Rules
Every page has exactly four "top level" chapters, which are given `##` (H2) headers:

* **Introduction** - This chapter is devoted to very high level, jargon-free marketing language explaining the benefits of the product in clear and simple prose.  The Introduction chapter has exactly three sections:

    * *Main uses* - This section has a definition list summarizing the key scenarios in which this product would be used.

    * *Core users* - This section has a definition list summarizing the key audiences that use this product.

    * *Key advantages* - This section has a definition list summarizing the major benefits of this product over the competition.

* **Concepts** - This chapter is devoted to establishing a clear, unambiguous lexicon for discussing this product.  It contains three or more definition list sections or section groups.  It does not contain any how-to or FAQ sections, the Concepts section is entirely focused on establishing the concepts themselves, not explaining how to use them.

* **Tutorials** - This chapter is devoted to providing detailed step-by-step instructions on how to accomplish certain goals.  This chapter contains three or more how-to sections or section groups.  Everything in the Tutorial should be consistent with the language established in the Concepts.

* **FAQ** - This chapter provides focused answers to very specific questions that are easily misunderstood or otherwise don't fit perfectly in the above chapters.  This chapter contains three or more FAQ-style sections or section groups.  The FAQ does not define any new terms (only the Concepts section does that), and does not give any step-by-step instructions (only the Tutorials section does that).

Anything outside of these four chapters should be moved within the relevant chapter, following the section guidelines for that chapter.


# Header Rules
There are two kinds of headers:

* **Short headers** - These are titles that are limited to 1-3 short words, such that it will fit into the "left hand nav" containing the table of contents, without "wrapping" around.  Short titles capitalize major words.  For example, this would be a short title:

    ```
    # Platforms
    ```

* **Long headers** - These are longer titles (4+ words), prefixed with a short title in square brackets.  This allows for longer and more descriptive titles, while still providing a short title that fits into the left-hand nav comfortably.  Long titles ask a complete question, and are capitalized and punctuated like a normal sentence.  For example, this would be a long title:

    ```
    # [Platforms] Where can I use the Expensify App?
    ```

* To avoid confusion, no two sections in the same chapter or section group should have the same short or long title.


# Section Rules
There are three kinds of sections:

## Definition lists
A "definition list" type section break a high level concept into smaller pieces, and consists of:

* A "long header" describing the topic being deconstructed and defined, generally starting with "What", but never "How" or "Why".
* 1-2 introductory sentences, explaining the theme of the list
* An unnumbered bullet list, where each bullet consists of:
    * A bolded term of 1-3 words
    * A clear definition or description of the term, in 1-3 complete sentences.
* Nothing should exist in the section after the bullet list

An example of a definition list section follows:

    ```
    # [Fruit] What are the best fruits?
    It's well known that these are the best fruits:

    * **Apples** - The king of fruit.  So crispy.
    * **Oranges** - Often seen as diametrically opposed.  But still delish.
    * **Tomato** - Some people don't know this is a fruit.  But it is.
    ```

## How-to lists
A "how-to list" type section gives sequential steps to accomplish a goal, and consists of:

* A "long header" describing the goal of the tutorial, starting with "How".
* 1-2 introductory sentences, explaining the goal of the tutorial
* A numbered list, where each step consists of a single sentence covering:
    * A specific UI element to press or type into, if any, in bold
    * An explanation of the benefit of doing this
    * Each step describes exactly one user action; do not combine multiple actions into a single step
* Confirm the sum of the steps accomplishes the clearly stated goal
* Confirm every concept mentioned in the tutorial has a corresponding definition in the Concepts section
* Nothing should exist in the section after the numbered list

An example of a how-to section follows:

    ```
    # [Email] How do I send an email?
    Email is the easiest way to write someone.  To send an email:

    1. Press the **Email** app icon, to open the app.
    2. Press the **Compose** button, to start writing the email.
    3. Enter the address you want to send to into the **To** field, so it gets to the right person.
    4. Provide a subject of the email in the **Subject** field, to entice them to open the email.
    5. Write the email into the large blank body, to detail the message.
    6. Press the **Send** button, to deliver it to its addressed recipient.
    ```

## Frequently Asked Question (FAQ) section
A "FAQ" type section gives a detailed answer to a single question, often to explain the non-obvious reasoning behind something, and consists of:

* A "long header", asking a specific question, generally starting with "Why"
    * Note: A FAQ cannot ask a "How do I...?" question -- move this to the Tutorials chapter and use a HowTo section
* 1 paragraph answering the question, in 2-4 comprehensive sentences.
    * Note: A FAQ cannot have a bullet list -- move this to the Concepts chapter and use a definition list section
    * Note: A FAQ cannot have a numbered list -- move this to the Tutorials chapter and use a HowTo section


# Section Groups
When the Concepts, Tutorials, or FAQ chapters have 6 or more sections, those sections can optionally be split into two or more "section groups".  Each section group consists of:

* A short header, named after the common theme of the sections of the section group
* 3-6 sections, of any type


# Cross Platform
All instructions should be written in a fashion to work across all platforms (web, mobile, desktop, native, etc).  Accordingly, the language should to the greatest degree possible be written in such a fashion that works across all platforms.  Specifically:

* Where possible, use a cross-platform verb.  For example, do not say "click" or "tap", say "press"
* If there is no suitable cross-platform term, briefly explain how to do the equivalent action on both platforms.  For example, "right-click or long-tap to open the context menu..."
* For anything that has no equivalent, clarify which platform the instruction refers to.  For example: "If you have a mouse, hover over the chat to see the hover menu..."

# Language Guidelines
To ensure that the content always sounds consistent:

* "You" always refers to the reader, who is a user and customer of Expensify
* "We" refers to the company Expensify, who is the author of the superapp this is documenting.
* Any use of "we" could be replaced with "Expensify" and would still work.
* The help documentation is in effect the product/company talking directly to the user, in the first person.

