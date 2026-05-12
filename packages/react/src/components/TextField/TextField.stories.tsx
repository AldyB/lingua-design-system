import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = { title: 'Inputs/TextField', component: TextField, tags: ['autodocs'] };
export default meta;

export const Default:     StoryObj<typeof TextField> = { args: { label: 'Spanish Word', placeholder: 'e.g. perro' } };
export const WithHint:    StoryObj<typeof TextField> = { args: { label: 'Email', placeholder: 'you@example.com', hint: 'We\'ll never share your email.' } };
export const WithError:   StoryObj<typeof TextField> = { args: { label: 'Password', type: 'password', error: 'Password must be at least 6 characters.' } };
