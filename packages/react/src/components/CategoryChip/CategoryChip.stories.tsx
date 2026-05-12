import type { Meta, StoryObj } from '@storybook/react';
import { CategoryChip } from './CategoryChip';

const meta: Meta<typeof CategoryChip> = { title: 'Domain/CategoryChip', component: CategoryChip, tags: ['autodocs'] };
export default meta;

export const AllCategories: StoryObj<typeof CategoryChip> = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {['general','food','travel','nature','people','work','home','health'].map(c => (
        <CategoryChip key={c} category={c} />
      ))}
    </div>
  ),
};
