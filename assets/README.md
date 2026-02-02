# Assets management

## Fonts

All fonts used by web and native apps are located inside `assets/fonts/` folder. The native app will use fonts with `.otf` or `.ttf` formats, where the web app will use fonts with `.otf`, `.ttf`, `.woff` or `.woff2` formats.

### Adding / Removing fonts

#### Native

The font files used by the native apps are stored inside `assets/fonts/native/` folder. We use the [@react-native-community/cli-link-assets](https://github.com/react-native-community/cli/tree/main/packages/cli-link-assets) tool to link the fonts to each platform (Android and iOS).

To add or remove a font used in the native app:

1. Add or remove the desired font files inside `assets/fonts/native/` folder.
2. Run `npx @react-native-community/cli-link-assets` to link the assets with the native files.
   * On Android, native files like `MainApplication.kt` and font files will be synced with the updated fonts.
   * On iOS, native files like `project.pbxproj` and `Info.plist` will be synced with the updated fonts.
3. If you are adding a new font family into the project:
   1. Add all the new font family variants to the [FontFamilyKey type](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/types.ts).
      ```ts
      type FontFamilyKey =
          | 'SYSTEM'
          | 'MONOSPACE'
          | 'MONOSPACE_BOLD'
          | 'EXP_NEUE'
          | 'EXP_NEUE_BOLD'
          | 'EXP_NEUE_ITALIC'
          | 'EXP_NEUE_BOLD_ITALIC'
          | 'EXP_NEW_KANSAS_MEDIUM'
          | 'EXP_NEW_KANSAS_MEDIUM_ITALIC'
          | 'NEW_FONT_FAMILY' // Add it here.
          | 'NEW_FONT_FAMILY_BOLD' // Add it here (it it exists).
          | 'NEW_FONT_FAMILY_ITALIC' // Add it here (it it exists).
          | 'NEW_FONT_FAMILY_BOLD_ITALIC'; // Add it here (it it exists).
      ```
   2. Add all the font variants to the [singleFontFamily file](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/singleFontFamily/index.ts), replacing `<new_font_family>` with the font family name (you can find the name inside `MainApplication.kt` file).
      ```ts
      const fontFamily: FontFamilyStyles = {
          ...
          NEW_FONT_FAMILY: {
              fontFamily: '<new_font_family>',
              fontStyle: 'normal',
              fontWeight: fontWeight.normal,
          },
          // Add the other variants too.
      };
      ```
4. If you are removing a font family from the project:
   1. Remove all the font family variants from the [FontFamilyKey type](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/types.ts).
   2. Remove all the font family variants from the [singleFontFamily file](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/singleFontFamily/index.ts).

#### Web

The font files used by the web app are stored inside `assets/fonts/web/` folder.

To add or remove a font used in the web app:

1. Add or remove the desired font files inside `assets/fonts/web/` folder.
2. If you are adding a new font family into the project:
   1. Add all the new font family variants to the [FontFamilyKey type](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/types.ts).
   2. Add all the font variants to the [multiFontFamily file](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/multiFontFamily/index.ts), replacing `<new_font_family>` with the font family name.
      ```ts
      const fontFamily: FontFamilyStyles = {
          ...
          NEW_FONT_FAMILY: {
              fontFamily: '<new_font_family>, Segoe UI Emoji, Noto Color Emoji',
              fontStyle: 'normal',
              fontWeight: fontWeight.normal,
          },
          // Add the other variants too.
      };
      ```
   3. Add all the new font family variants to the [fonts.css file](https://github.com/Expensify/App/blob/main/assets/css/fonts.css), replacing `<new_font_family>` with the font family name and `<font-family-file>` with the file name.
      ```css
      @font-face {
          font-family: <new_font_family>;
          font-weight: 500;
          font-style: normal;
          src: url('/fonts/<font-family-file>.woff2') format('woff2'),  url('/fonts/<font-family-file>.woff') format('woff');
      }
      /* Add the other variants too. */
      ```
3. If you are removing a font family from the project:
   1. Remove all the font family variants from the [FontFamilyKey type](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/types.ts).
   2. Remove all the font family variants from the [multiFontFamily file](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/fontFamily/multiFontFamily/index.ts).
   3. Remove all the font family variants from the [fonts.css file](https://github.com/Expensify/App/blob/main/assets/css/fonts.css).

#### Storybook (Web)

The font files used by the Storybook web app are stored inside `assets/fonts/web/` folder.

To add or remove a font used in the storybook web app:

1. Add or remove the desired font files inside `assets/fonts/web/` folder.
2. If you are adding a new font family into the project:
   1. Add all the new font family variants to the [fonts.css storybook file](https://github.com/Expensify/App/blob/main/.storybook/fonts.css), replacing `<new_font_family>` with the font family name and `<font-family-file>` with the file name.
      ```css
      @font-face {
          font-family: <new_font_family>;
          font-weight: 500;
          font-style: normal;
          src: url('../assets/fonts/web/<font-family-file>.woff2') format('woff2'),  url('../assets/fonts/web/<font-family-file>.woff') format('woff');
      }
      /* Add the other variants too. */
      ```
3. If you are removing a font family from the project:
   1. Remove all the font family variants from the [fonts.css storybook file](https://github.com/Expensify/App/blob/main/.storybook/fonts.css).

#### Expensify Help (Web)

The fonts files used by the Expensify Help web app are located inside `docs/assets/fonts/` folder.

To add or remove a font used in the Expensify Help web app:

1. Add or remove the desired font files inside `docs/assets/fonts/` folder.
2. If you are adding a new font family into the project:
   1. Add all the new font family variants to the [_fonts.scss file](https://github.com/Expensify/App/blob/main/docs/_sass/_fonts.scss), replacing `<new_font_family>` with the font family name and `<font-family-file>` with the file name.
      ```scss
      @font-face {
        font-family: <new_font_family>;
        font-weight: 500;
        font-style: normal;
        src: url('/assets/fonts/<font-family-file>.woff2') format('woff2'), url('/assets/fonts/<font-family-file>.woff') format('woff');
      }
      /* Add the other variants too. */
      ```
3. If you are removing a font family from the project:
   1. Remove all the font family variants from the [_fonts.scss file](https://github.com/Expensify/App/blob/main/docs/_sass/_fonts.scss).

### Using the fonts

#### Native / Web

To use your fonts in the app, just import the desired font from [FontUtils](https://github.com/Expensify/App/blob/main/src/styles/utils/FontUtils/index.ts) and use in your style objects.

You should use `FontUtils.fontFamily.platform.<font-family-key>` for most use cases in the app because it will use the correspondent set of font families (with fallback fonts or not) according to the platform. `FontUtils.fontFamily.single.` and `FontUtils.fontFamily.multi.` should only be used when we want a specific set of font families independently of the platform.

```ts
import FontUtils from '@styles/utils/FontUtils';

const style = {
    h4: {
        ...FontUtils.fontFamily.platform.NEW_FONT_FAMILY,
        fontSize: variables.fontSizeLabel,
    },
};
```

#### Storybook / Expensify Help

To use your fonts in Storybook and Expensify Help, simply apply and use them as you would with regular web files.