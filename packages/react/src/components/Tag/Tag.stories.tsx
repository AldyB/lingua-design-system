import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = { title: 'Primitives/Tag', component: Tag, tags: ['autodocs'] };
export default meta;

export const Default:    StoryObj<typeof Tag> = { args: { children: 'Spanish' } };
export const Removable:  StoryObj<typeof Tag> = { args: { children: 'Food', onRemove: () => {} } };
