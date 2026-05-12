import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title:     'Primitives/Button',
  component: Button,
  tags:      ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary','secondary','ghost','outline','destructive'] },
    size:    { control: 'select', options: ['sm','md','lg','icon'] },
    loading: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story     = { args: { children: 'Start Session', variant: 'primary' } };
export const Secondary: Story   = { args: { children: 'Cancel', variant: 'secondary' } };
export const Ghost: Story       = { args: { children: 'Skip', variant: 'ghost' } };
export const Outline: Story     = { args: { children: 'Done', variant: 'outline' } };
export const Destructive: Story = { args: { children: 'Delete Card', variant: 'destructive' } };
export const Small: Story       = { args: { children: 'Small', size: 'sm' } };
export const Large: Story       = { args: { children: 'Large', size: 'lg' } };
export const Loading: Story     = { args: { children: 'Saving…', loading: true } };
export const Disabled: Story    = { args: { children: 'Unavailable', disabled: true } };
