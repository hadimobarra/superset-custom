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
import { useMemo } from 'react';
import { t } from '@apache-superset/core/translation';
import { DashboardInfo } from 'src/dashboard/types';
import MetadataBar, {
  MetadataType,
} from '@superset-ui/core/components/MetadataBar';
import getOwnerName from 'src/utils/getOwnerName';
import { formatDateToPersian } from 'src/utils/persianCalendar';

export const useDashboardMetadataBar = (dashboardInfo: DashboardInfo) => {
  const rawInfo = dashboardInfo as DashboardInfo & {
    changed_on?: string;
    created_on?: string;
  };
  const items = useMemo(
    () => [
      {
        type: MetadataType.LastModified as const,
        value: rawInfo.changed_on
          ? formatDateToPersian(rawInfo.changed_on, true)
          : rawInfo.changed_on_delta_humanized,
        modifiedBy:
          getOwnerName(rawInfo.changed_by) || t('Not available'),
      },
      {
        type: MetadataType.Owner as const,
        createdBy: getOwnerName(rawInfo.created_by) || t('Not available'),
        owners:
          rawInfo.owners.length > 0
            ? rawInfo.owners.map(getOwnerName)
            : t('None'),
        createdOn: rawInfo.created_on
          ? formatDateToPersian(rawInfo.created_on, true)
          : rawInfo.created_on_delta_humanized,
      },
    ],
    [
      rawInfo.changed_by,
      rawInfo.changed_on,
      rawInfo.changed_on_delta_humanized,
      rawInfo.created_by,
      rawInfo.created_on,
      rawInfo.created_on_delta_humanized,
      rawInfo.owners,
    ],
  );

  return <MetadataBar items={items} tooltipPlacement="bottom" />;
};
