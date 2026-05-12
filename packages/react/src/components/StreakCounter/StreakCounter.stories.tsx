import type { Meta, StoryObj } from '@storybook/react';
import { StreakCounter } from './StreakCounter';

const meta: Meta<typeof StreakCounter> = { title: 'Domain/StreakCounter', component: StreakCounter, tags: ['autodocs'] };
export default meta;

export const OneDay:     StoryObj<typeof StreakCounter> = { args: { days: 1 } };
export const FiveDays:   StoryObj<typeof StreakCounter> = { args: { days: 5 } };
export const Milestone:  StoryObj<typeof StreakCounter> = { args: { days: 30 } };
