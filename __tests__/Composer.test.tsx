import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { Composer } from '@/components/Composer';

describe('Composer', () => {
  it('does not send blank messages', async () => {
    const onSend = jest.fn();
    await render(<Composer placeholder="Type a message..." onSend={onSend} />);
    await fireEvent.press(screen.getByLabelText('Send message'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends trimmed text and clears the input', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    await render(<Composer placeholder="Type a message..." onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');
    await fireEvent.changeText(input, '  hello  ');
    await fireEvent.press(screen.getByLabelText('Send message'));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith('hello'));
    await waitFor(() => expect(input.props.value).toBe(''));
  });

  it('keeps the draft when sending fails', async () => {
    const onSend = jest.fn().mockRejectedValue(new Error('nope'));
    await render(<Composer placeholder="Type a message..." onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');
    await fireEvent.changeText(input, 'keep me');
    await fireEvent.press(screen.getByLabelText('Send message'));
    await waitFor(() => expect(onSend).toHaveBeenCalled());
    expect(input.props.value).toBe('keep me');
  });
});
