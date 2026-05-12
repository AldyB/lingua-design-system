import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';
import { Button } from '../Button/Button';

const meta: Meta<typeof Sheet> = { title: 'Surfaces/Sheet', component: Sheet, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof Sheet> = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet open={open} onClose={() => setOpen(false)} title="End this round?">
          <p style={{ color: 'var(--color-muted-fg)', fontSize: 14, marginBottom: 16 }}>Your progress will be saved.</p>
          <Button variant="destructive" style={{ width: '100%', marginBottom: 8 }} onClick={() => setOpen(false)}>End Round</Button>
          <Button variant="outline" style={{ width: '100%' }} onClick={() => setOpen(false)}>Continue Studying</Button>
        </Sheet>
      </>
    );
  },
};
