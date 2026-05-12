import type { Preview } from '@storybook/react';
import '../../tokens/dist/css/lingua.light.css';
import '../../tokens/dist/css/lingua.dark.css';
import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design token theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark',  title: 'Dark',  icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals['theme'] ?? 'light';
      document.body.style.background = 'var(--color-background)';
      document.body.style.padding    = '24px';
      return Story();
    },
  ],
  parameters: {
    backgrounds: { disable: true },
    layout: 'padded',
  },
};

export default preview;
