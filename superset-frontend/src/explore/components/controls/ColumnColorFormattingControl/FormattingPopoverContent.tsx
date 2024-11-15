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
import React from 'react';
import { styled, SupersetTheme, t, useTheme } from '@superset-ui/core';
import { Form, FormItem } from 'src/components/Form';
import Select from 'src/components/Select/Select';
import { Col, Row } from 'src/components';
import { Input } from 'src/components/Input';
import Button from 'src/components/Button';
import {
  ColumnColorFormatingConfig,
} from './types';

const JustifyEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const colorSchemeOptions = (theme: SupersetTheme) => [
  { value: theme.colors.success.light1, label: t('success') },
  { value: theme.colors.alert.light1, label: t('alert') },
  { value: theme.colors.error.light1, label: t('error') },
  { value: theme.colors.success.dark1, label: t('success dark') },
  { value: theme.colors.alert.dark1, label: t('alert dark') },
  { value: theme.colors.error.dark1, label: t('error dark') },
];

const rulesRequired = [{ required: true, message: t('Required') }];
export const FormattingPopoverContent = ({
  config,
  onChange,
  columns = [],
  vizType,
}: {
  config?: ColumnColorFormatingConfig;
  onChange: (config: ColumnColorFormatingConfig) => void;
  columns: { label: string; value: string }[];
  vizType: string;
}) => {
  const theme = useTheme();
  const colorScheme = colorSchemeOptions(theme);
  return (
    <Form
      onFinish={onChange}
      initialValues={config}
      requiredMark="optional"
      layout="vertical"
    >
      <Row gutter={12}>
        <Col span={12}>
          <FormItem
            name="column"
            label={t('Column')}
            rules={rulesRequired}
            initialValue={columns[0]?.value}
          >
            <Select ariaLabel={t('Select column')} options={columns} />
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem
            name="colorScheme"
            label={t('Color scheme')}
            rules={rulesRequired}
            initialValue={colorScheme[0].value}
          >
            <Input aria-label={t('Color scheme')} placeholder={t('Enter color scheme')} />
          </FormItem>
        </Col>
      </Row>
      {(vizType === 'pie-extend') && <Row>
        <Col span={12}>
          <FormItem
            name="columnEntity"
            label={t('Column Entity')}
            rules={rulesRequired}
            initialValue={colorScheme[0].value}
          >
            <Input aria-label={t('Column value')} placeholder={t('Enter column value')} />
          </FormItem>
        </Col>
      </Row>}
      <FormItem>
        <JustifyEnd>
          <Button htmlType="submit" buttonStyle="primary">
            {t('Apply')}
          </Button>
        </JustifyEnd>
      </FormItem>
    </Form>
  );
};
