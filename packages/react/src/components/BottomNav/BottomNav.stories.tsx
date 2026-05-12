import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from './BottomNav';

const ITEMS = [
  { label: 'Home',     icon: '🏠', active: true },
  { label: 'Study',    icon: '📖' },
  { label: 'Create',   icon: '➕' },
  { label: 'Progress', icon: '📈' },
];

const meta: Meta<typeof BottomNav> = { title: 'Navigation/BottomNav', component: BottomNav, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof BottomNav> = {
  render: () => (
    <div style={{ position: 'relative', height: 120 }}>
      <BottomNav items={ITEMS} fixed={false} />
    </div>
  ),
};
