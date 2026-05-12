import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = { title: 'Feedback/ProgressBar', component: ProgressBar, tags: ['autodocs'] };
export default meta;

export const HalfWay:  StoryObj<typeof ProgressBar> = { args: { value: 50, label: 'Study progress' } };
export const Complete: StoryObj<typeof ProgressBar> = { args: { value: 100, variant: 'success', label: 'Complete' } };
export const Warning:  StoryObj<typeof ProgressBar> = { args: { value: 25, variant: 'warning', label: 'Low progress' } };
export const Small:    StoryObj<typeof ProgressBar> = { args: { value: 67, size: 'sm' } };
export const Large:    StoryObj<typeof ProgressBar> = { args: { value: 80, size: 'lg' } };
export const Session: StoryObj<typeof ProgressBar> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-muted-fg)' }}>
        <span>Card 3 of 8</span><span>37%</span>
      </div>
      <ProgressBar value={3} max={8} label="Session progress" />
    </div>
  ),
};
