/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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
import { getTimeFormatter, TimeFormats } from '@superset-ui/core';
import NullCell from '../NullCell';
import { formatDateToPersian } from 'src/utils/persianCalendar';

export interface TimeCellProps {
  format?: string;
  value?: number | Date;
}

function TimeCell({
  format = TimeFormats.DATABASE_DATETIME,
  value,
}: TimeCellProps) {
  if (value) {
    // Use Persian date formatting for UI display
    const date = value instanceof Date ? value : new Date(value);
    return <span>{formatDateToPersian(date, true)}</span>;
  }
  return <NullCell />;
}

export default TimeCell;
