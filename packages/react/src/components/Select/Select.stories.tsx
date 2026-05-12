import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'food',    label: 'Food & Drink' },
  { value: 'travel',  label: 'Travel' },
  { value: 'nature',  label: 'Nature' },
];

const meta: Meta<typeof Select> = { title: 'Inputs/Select', component: Select, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof Select> = { args: { label: 'Category', options: CATEGORIES, placeholder: 'Select a category' } };
