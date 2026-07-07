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

import { render, screen, waitFor } from 'spec/helpers/testing-library';
import type { Dayjs } from '@superset-ui/core/utils/dates';
import { JalaliDatePicker } from 'src/explore/components/controls/DateFilterControl/components/JalaliDatePicker';
import { PersianCalendarFrame } from 'src/explore/components/controls/DateFilterControl/components/PersianCalendarFrame';
import { extendedDayjs as dayjs } from '@superset-ui/core/utils/dates';
import { gregorianToPersian } from 'src/utils/persianCalendar';

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({ ref: jest.fn(), width: 800 }),
}));

jest.mock('react-multi-date-picker', () => {
  // Create a mock that mimics the real component's behavior
  const mockOnChange = jest.fn();
  
  // Store the mock so tests can access it
  (global as any).__MOCK_DATE_PICKER_ON_CHANGE__ = mockOnChange;
  
  return {
    __esModule: true,
    default: ({
      onChange,
      value,
      placeholder,
      multiple,
      range,
    }: {
      onChange: (value: any) => void;
      value: any;
      placeholder: string;
      multiple: boolean;
      range: boolean;
    }) => {
      // Call the onChange with the value prop to simulate the component
      // accepting the value and calling onChange with it
      if (value !== undefined) {
        // Call onNextTick to simulate async behavior
        Promise.resolve().then(() => onChange(value));
      }
      
      if (range) {
        return (
          <div>
            <input
              placeholder={`${placeholder} start`}
              data-testid="jalali-start-input"
              onBlur={() => {
                // Simulate calling onChange with current value when input loses focus
                if (value && Array.isArray(value) && value[0]) {
                  onChange(value);
                }
              }}
            />
            <input
              placeholder={`${placeholder} end`}
              data-testid="jalali-end-input"
              onBlur={() => {
                // Simulate calling onChange with current value when input loses focus
                if (value && Array.isArray(value) && value[1]) {
                  onChange(value);
                }
              }}
            />
          </div>
        );
      }
      
      return (
        <input
          placeholder={placeholder}
          data-testid="jalali-input"
          onBlur={() => {
            // Simulate calling onChange with current value when input loses focus
            if (value) {
              onChange(value);
            }
          }}
        />
      );
    },
  };
});

describe('JalaliDatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (global.__MOCK_DATE_PICKER_ON_CHANGE__) {
      global.__MOCK_DATE_PICKER_ON_CHANGE__.mockClear();
    }
  });

  // --- Basic Rendering ---
  
  test('renders single mode picker with placeholder', () => {
    render(<JalaliDatePicker mode="single" value={null} onChange={jest.fn()} />);
    
    expect(
      screen.getByPlaceholderText(/تاریخ را انتخاب کنید/i)
    ).toHaveAttribute('data-testid', 'jalali-input');
  });

  test('renders range mode picker with placeholders', () => {
    render(<JalaliDatePicker mode="range" value={[null, null]} onChange={jest.fn()} />);
    
    expect(
      screen.getByPlaceholderText(/تاریخ را انتخاب کنید start/i)
    ).toHaveAttribute('data-testid', 'jalali-start-input');
    expect(
      screen.getByPlaceholderText(/تاریخ را انتخاب کنید end/i)
    ).toHaveAttribute('data-testid', 'jalali-end-input');
  });

  // --- Props Tests ---
  
  test('accepts custom placeholder', () => {
    const customPlaceholder = 'Select a date';
    render(<JalaliDatePicker 
      mode="single" 
      value={null} 
      onChange={jest.fn()} 
      placeholder={customPlaceholder} 
    />);
    
    expect(
      screen.getByPlaceholderText(customPlaceholder)
    ).toBeInTheDocument();
  });

  test('accepts minYear and maxYear props', () => {
    render(<JalaliDatePicker 
      mode="single" 
      value={null} 
      onChange={jest.fn()} 
      minYear={1300} 
      maxYear={1500} 
    />);
    
    // Just verify it renders without error
    expect(screen.getByPlaceholderText(/تاریخ را انتخاب کنید/i)).toBeInTheDocument();
  });

  test('accepts forceRTL prop', () => {
    render(<JalaliDatePicker 
      mode="single" 
      value={null} 
      onChange={jest.fn()} 
      forceRTL={true} 
    />);
    
    // Just verify it renders without error
    expect(screen.getByPlaceholderText(/تاریخ را انتخاب کنید/i)).toBeInTheDocument();
  });

  // --- Integration Tests ---
  
  describe('Integration Tests', () => {
    test('integrates with PersianCalendarFrame without errors', () => {
      const onChange = jest.fn();
      // This should not throw any errors
      const { container } = render(
        <PersianCalendarFrame 
          value="2024-01-10 : 2024-01-20" 
          onChange={onChange} 
        />
      );
      
      // Should render successfully
      expect(container).toBeTruthy();
      
      // Should contain the expected text
      expect(
        screen.getByText(/Selected Jalali range/i)
      ).toBeInTheDocument();
    });
  });
});