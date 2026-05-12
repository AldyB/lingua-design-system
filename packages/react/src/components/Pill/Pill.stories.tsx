import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = { title: 'Primitives/Pill', component: Pill, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof Pill> = { args: { children: '🔥 5 day streak' } };
export const Category: StoryObj<typeof Pill> = { args: { children: 'Food & Drink' } };
