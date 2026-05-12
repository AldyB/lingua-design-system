import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = { title: 'Primitives/Avatar', component: Avatar, tags: ['autodocs'] };
export default meta;

export const Fallback: StoryObj<typeof Avatar> = { args: { alt: 'Aldair Borges', size: 'md' } };
export const Small:    StoryObj<typeof Avatar> = { args: { alt: 'Ana López', size: 'sm' } };
export const Large:    StoryObj<typeof Avatar> = { args: { alt: 'Carlos Ruiz', size: 'lg' } };
