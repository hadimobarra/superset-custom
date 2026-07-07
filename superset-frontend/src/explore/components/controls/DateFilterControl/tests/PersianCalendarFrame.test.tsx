/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information regarding
 * copyright ownership.  The ASF licenses this file to you under the
 * Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { NO_TIME_RANGE } from '@superset-ui/core';
import {
  screen,
  render,
  fireEvent,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import {
  extendedDayjs as dayjs,
  type Dayjs,
} from '@superset-ui/core/utils/dates';
import type { JalaliDatePickerProps } from 'src/explore/components/controls/DateFilterControl/components/JalaliDatePicker';
import { PersianCalendarFrame } from 'src/explore/components/controls/DateFilterControl/components/PersianCalendarFrame';

jest.mock(
  'src/explore/components/controls/DateFilterControl/components/JalaliDatePicker',
  () => {
    const { extendedDayjs } = jest.requireActual(
      '@superset-ui/core/utils/dates',
    );
    const parseDate = (input: string) =>
      input ? extendedDayjs(input, 'YYYY-MM-DD') : null;
    return {
      JalaliDatePicker: ({
        value,
        onChange,
        placeholder,
        mode,
      }: JalaliDatePickerProps) => {
        if (mode === 'range') {
          const [start, end] = (value as [Dayjs | null, Dayjs | null]) ?? [
            null,
            null,
          ];
          return (
            <div>
              <input
                aria-label={`${placeholder}-start`}
                value={start ? start.format('YYYY-MM-DD') : ''}
                onChange={event =>
                  onChange([parseDate(event.target.value), end ?? null])
                }
              />
              <input
                aria-label={`${placeholder}-end`}
                value={end ? end.format('YYYY-MM-DD') : ''}
                onChange={event =>
                  onChange([start ?? null, parseDate(event.target.value)])
                }
              />
            </div>
          );
        }
        const singleValue = value as Dayjs | null;
        return (
          <input
            aria-label={placeholder}
            value={singleValue ? singleValue.format('YYYY-MM-DD') : ''}
            onChange={event => onChange(parseDate(event.target.value))}
          />
        );
      },
    };
  },
);

// --- Rendering ---

test('renders the title and all preset radio options', () => {
  render(<PersianCalendarFrame value="Last 7 days" onChange={jest.fn()} />);

  expect(screen.getByText(/Persian calendar filter/i)).toBeInTheDocument();
  expect(
    screen.getByRole('radio', { name: /Last 7 days/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('radio', { name: /Last 30 days/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('radio', { name: /Last 90 days/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('radio', { name: /Last year/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('radio', { name: /Custom range/i }),
  ).toBeInTheDocument();
});

test('renders the current Jalali date card', () => {
  render(<PersianCalendarFrame value="Last 7 days" onChange={jest.fn()} />);

  expect(
    screen.getByText(/Current Jalali date/i),
  ).toBeInTheDocument();
});

// --- Preset selection ---

test('applies relative range on radio change', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value="Last 7 days" onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Last 30 days/i }));

  expect(onChange).toHaveBeenCalledWith('Last 30 days');
});

test('applies Last year range', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value="Last 7 days" onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Last year/i }));

  expect(onChange).toHaveBeenCalledWith('Last year');
});

test('applies Last 90 days range', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value="Last 7 days" onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Last 90 days/i }));

  expect(onChange).toHaveBeenCalledWith('Last 90 days');
});

test('does not show custom range inputs for relative presets', () => {
  render(<PersianCalendarFrame value="Last 7 days" onChange={jest.fn()} />);

  expect(screen.queryByLabelText(/Select date range-start/i)).toBeNull();
  expect(screen.queryByLabelText(/Select date range-end/i)).toBeNull();
});

// --- Custom range ---

test('shows custom range inputs when Custom range is selected', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  expect(
    screen.getByLabelText('Select date range-start'),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText('Select date range-end'),
  ).toBeInTheDocument();
});

test('emits custom range when both Jalali pickers are filled', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');

  fireEvent.change(startInput, { target: { value: '2024-01-10' } });
  fireEvent.change(endInput, { target: { value: '2024-01-12' } });

  expect(onChange).toHaveBeenLastCalledWith('2024-01-10 : 2024-01-12');
});

test('custom range defaults both inputs to today when enabled', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const isoDate = dayjs().format('YYYY-MM-DD');
  await waitFor(() =>
    expect(
      screen.getByLabelText('Select date range-start'),
    ).toHaveValue(isoDate),
  );
  expect(
    screen.getByLabelText('Select date range-end'),
  ).toHaveValue(isoDate);
});

test('shows selected Jalali range summary when custom range is filled', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');

  fireEvent.change(startInput, { target: { value: '2024-01-10' } });
  fireEvent.change(endInput, { target: { value: '2024-01-12' } });

  expect(screen.getByText(/Selected Jalali range/i)).toBeInTheDocument();
});

// --- Persistence ---

test('parses persisted custom range values', () => {
  render(
    <PersianCalendarFrame
      value="2024-01-01 : 2024-01-05"
      onChange={jest.fn()}
    />,
  );

  expect(
    screen.getByText(/Selected Jalali range/i),
  ).toBeInTheDocument();
});

test('selects persisted relative range radio button', () => {
  render(<PersianCalendarFrame value="Last year" onChange={jest.fn()} />);

  expect(
    screen.getByRole('radio', { name: /Last year/i }),
  ).toBeChecked();
});

test('defaults to Last 7 days when value is empty', () => {
  render(<PersianCalendarFrame value="" onChange={jest.fn()} />);

  expect(
    screen.getByRole('radio', { name: /Last 7 days/i }),
  ).toBeChecked();
});

test('defaults to Last 7 days when value is NO_TIME_RANGE', () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  expect(
    screen.getByRole('radio', { name: /Last 7 days/i }),
  ).toBeChecked();
});

// --- "Set start/end to today" buttons ---

test('set start to today button updates start date', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');

  // Set end to a fixed date first
  fireEvent.change(endInput, { target: { value: '2024-06-15' } });

  // Click "Set start to today"
  await userEvent.click(screen.getByText(/Set start to today/i));

  const today = dayjs().format('YYYY-MM-DD');
  expect(startInput).toHaveValue(today);
});

test('set end to today button updates end date', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');

  // Set start to a fixed date first
  fireEvent.change(startInput, { target: { value: '2024-01-01' } });

  // Click "Set end to today"
  await userEvent.click(screen.getByText(/Set end to today/i));

  const today = dayjs().format('YYYY-MM-DD');
  expect(endInput).toHaveValue(today);
});

// --- Range value mapping ---

test('recognizes all persisted range values', () => {
  const rangeValues = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last year'];
  for (const value of rangeValues) {
    const { unmount } = render(
      <PersianCalendarFrame value={value} onChange={jest.fn()} />,
    );
    expect(screen.getByRole('radio', { name: new RegExp(value, 'i') })).toBeChecked();
    unmount();
  }
});

// --- Custom range clearing ---

test('switching from custom range to preset clears custom dates', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={onChange} />);

  // Select custom range
  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');
  fireEvent.change(startInput, { target: { value: '2024-01-10' } });
  fireEvent.change(endInput, { target: { value: '2024-01-12' } });

  // Switch to a preset
  await userEvent.click(screen.getByRole('radio', { name: /Last 30 days/i }));

  expect(onChange).toHaveBeenLastCalledWith('Last 30 days');
  expect(screen.queryByLabelText(/Select date range-start/i)).toBeNull();
});