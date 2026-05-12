import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = { title: 'Inputs/RadioGroup', component: RadioGroup, tags: ['autodocs'] };
export default meta;

export const DailyGoal: StoryObj<typeof RadioGroup> = {
  render: () => {
    const [val, setVal] = useState('10');
    return (
      <RadioGroup
        name="daily-goal"
        label="Daily Goal"
        value={val}
        onChange={setVal}
        options={[
          { value: '5',  label: '5 minutes / day' },
          { value: '10', label: '10 minutes / day' },
          { value: '15', label: '15 minutes / day' },
          { value: '30', label: '30 minutes / day' },
        ]}
      />
    );
  },
};
