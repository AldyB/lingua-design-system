import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = { title: 'Inputs/Switch', component: Switch, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof Switch> = {
  render: () => {
    const [on, setOn] = useState(false);
    return <Switch checked={on} onChange={setOn} label="Daily reminders" />;
  },
};
export const On: StoryObj<typeof Switch> = {
  render: () => {
    const [on, setOn] = useState(true);
    return <Switch checked={on} onChange={setOn} label="Enable notifications" />;
  },
};
