import type { Meta, StoryObj } from '@storybook/react';
import { Flashcard } from './Flashcard';

const meta: Meta<typeof Flashcard> = {
  title:     'Domain/Flashcard',
  component: Flashcard,
  tags:      ['autodocs'],
  decorators: [(Story) => (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <Story />
    </div>
  )],
};
export default meta;

export const Default: StoryObj<typeof Flashcard> = {
  args: {
    front: 'perro',
    back:  'dog',
    exampleFront: 'El perro es muy amigable.',
    exampleBack:  'The dog is very friendly.',
  },
};

export const Simple: StoryObj<typeof Flashcard> = {
  args: { front: 'gato', back: 'cat' },
};

export const WithCallbacks: StoryObj<typeof Flashcard> = {
  args: {
    front: 'casa',
    back:  'house',
    exampleFront: 'La casa es grande.',
    onCorrect:   () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect'),
  },
};
