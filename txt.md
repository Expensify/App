- Target: 
   Introduce toggle for High Contrast mode
   Add two new themes light-contrast and dark-contrast
   Add potential new variables to some things
   Swap some component's use of variable colors

--------------------------------------------------------------------------------------------------------------------------------
Let's dive into the details:
1. Introduce toggle for High Contrast mode

- In /settings/preferences/theme, Introduce new toggle button "High contrast mode" so beside the original theme "light", "dark", "system", we will have light | dark | system | light-contrast | dark-contrast | system-contrast. If not toggle, theme will be light | dark | system, if toggle, the theme will be light-contrast | dark-contrast | system-contrast.

2. Add two new themes light-contrast and dark-contrast
Here's the key changes to the theme:

|               | Light                    | Dark                   | Light Contrast          | Dark Contrast           |
|---------------|--------------------------|------------------------|-------------------------|-------------------------|
| borders       | colors.productLight400   | colors.productDark400  | colors.productLight500  | colors.productDark500   |
| icons         | colors.productLight700   | colors.productDark700  | colors.productLight800  | colors.productDark700   |
| textSupporting| colors.productLight800   | colors.productDark800  | #53645C                 | colors.productDark700   |
| buttonSuccessText | colors.productLight100 | colors.productLight100 | colors.productLight900  | colors.productDark900   |
| mentionText   | colors.blue600           | blue100                | colors.blue700          | colors.blue600          |

3. Add potential new variables to some things

|             | Light                   | Dark                  | Light Contrast          | Dark Contrast           |
|-------------|-------------------------|-----------------------|-------------------------|-------------------------|
| bordersBold | colors.productLight400  | colors.productDark400 | colors.productLight800  | colors.productDark700   |
| buttonIcon  | colors.productLight700  | colors.productDark700 | colors.productLight900  | colors.productDark900   |


4. Swap some component's variable use
Input fields, checkboxes and radio buttons should all use this new border-bold variant. Again normal themes won't see the difference here, but on high contrast it will look slightly bolder.
The icons in the buttons will also have to change to use the new button icon above.