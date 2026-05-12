import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from './TopBar';

const meta: Meta<typeof TopBar> = { title: 'Navigation/TopBar', component: TopBar, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof TopBar> = {
  args: { title: '¡Hola!', subtitle: 'Ready to practice?' },
};
export const WithActions: StoryObj<typeof TopBar> = {
  args: {
    title: 'Lingua',
    rightActions: (
      <>
        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18 }}>⚙</button>
        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18 }}>🚪</button>
      </>
    ),
  },
};
