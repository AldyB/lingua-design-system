import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = { title: 'Inputs/Checkbox', component: Checkbox, tags: ['autodocs'] };
export default meta;

export const Default:  StoryObj<typeof Checkbox> = { args: { label: 'Enable daily reminders' } };
export const Checked:  StoryObj<typeof Checkbox> = { args: { label: 'Enable daily reminders', defaultChecked: true } };
export const Disabled: StoryObj<typeof Checkbox> = { args: { label: 'Premium feature', disabled: true } };
