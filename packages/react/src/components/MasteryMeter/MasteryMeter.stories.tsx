import type { Meta, StoryObj } from '@storybook/react';
import { MasteryMeter } from './MasteryMeter';

const meta: Meta<typeof MasteryMeter> = { title: 'Domain/MasteryMeter', component: MasteryMeter, tags: ['autodocs'] };
export default meta;

export const Default: StoryObj<typeof MasteryMeter> = { args: { mastered: 8, learning: 3, newCards: 1 } };
export const Empty:   StoryObj<typeof MasteryMeter> = { args: { mastered: 0, learning: 0, newCards: 5 } };
export const Full:    StoryObj<typeof MasteryMeter> = { args: { mastered: 20, learning: 0, newCards: 0 } };
