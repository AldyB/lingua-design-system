import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = { title: 'Feedback/Spinner', component: Spinner, tags: ['autodocs'] };
export default meta;

export const Small:  StoryObj<typeof Spinner> = { args: { size: 'sm' } };
export const Medium: StoryObj<typeof Spinner> = { args: { size: 'md' } };
export const Large:  StoryObj<typeof Spinner> = { args: { size: 'lg' } };
