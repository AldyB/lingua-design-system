import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardTitle, CardContent } from './Card';

const meta: Meta<typeof Card> = { title: 'Surfaces/Card', component: Card, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof Card> = {
  render: () => (
    <Card>
      <CardTitle>Ready to study?</CardTitle>
      <CardContent><p style={{ color: 'var(--color-muted-fg)', fontSize: 14 }}>You have 8 cards due today.</p></CardContent>
    </Card>
  ),
};

export const Interactive: StoryObj<typeof Card> = {
  render: () => (
    <Card interactive onClick={() => alert('clicked')}>
      <CardTitle>⊕ Add New Word</CardTitle>
      <CardContent><p style={{ color: 'var(--color-muted-fg)', fontSize: 14 }}>Learn a new Spanish word today.</p></CardContent>
    </Card>
  ),
};
