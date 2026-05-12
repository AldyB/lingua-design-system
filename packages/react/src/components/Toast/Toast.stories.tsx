import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = { title: 'Feedback/Toast', component: Toast, tags: ['autodocs'] };
export default meta;

export const Default:  StoryObj<typeof Toast> = { args: { title: 'Card saved!', description: 'perro has been added to your deck.' } };
export const Success:  StoryObj<typeof Toast> = { args: { title: '¡Excelente!', description: '87% accuracy — streak extended!', variant: 'success', icon: '🏆' } };
export const Error:    StoryObj<typeof Toast> = { args: { title: 'Translation failed', description: 'Check your connection and try again.', variant: 'error' } };
export const Warning:  StoryObj<typeof Toast> = { args: { title: 'No cards due', description: 'Come back tomorrow to continue your streak.', variant: 'warning' } };
export const WithClose: StoryObj<typeof Toast> = { args: { title: 'Card saved!', onClose: () => {} } };
