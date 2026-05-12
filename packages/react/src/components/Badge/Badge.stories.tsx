import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Primitives/Badge', component: Badge, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default:     Story = { args: { children: 'General' } };
export const Primary:     Story = { args: { children: 'New', variant: 'primary' } };
export const Success:     Story = { args: { children: 'Mastered', variant: 'success' } };
export const Warning:     Story = { args: { children: 'Due', variant: 'warning' } };
export const Destructive: Story = { args: { children: 'Error', variant: 'destructive' } };
