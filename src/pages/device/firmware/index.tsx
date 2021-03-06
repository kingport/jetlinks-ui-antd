import React, { Fragment, useEffect, useState } from 'react';
import styles from '@/utils/table.less';
import { FirmwareData } from './data';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Card, Divider, message, Popconfirm, Spin, Table } from 'antd';
import { ColumnProps, PaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import { Dispatch } from '@/models/connect';
import { SorterResult } from 'antd/es/table';
import SearchForm from '@/components/SearchForm';
import apis from '@/services';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import Save from '@/pages/device/firmware/save';
import encodeQueryParam from '@/utils/encodeParam';
import { router } from 'umi';

interface Props extends FormComponentProps {
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  searchParam: any;
  saveVisible: boolean;
  firmwareData: any;
  saveFirmwareData: any;
}

const Firmware: React.FC<Props> = props => {
  const initState: State = {
    searchParam: {
      pageSize: 10,
      sorts: {
        order: 'descend',
        field: 'id',
      },
    },
    saveVisible: false,
    firmwareData: {},
    saveFirmwareData: {},
  };

  const [productList, setProductList] = useState([]);
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [firmwareData, setFirmwareData] = useState(initState.firmwareData);
  const [saveFirmwareData, setSaveFirmwareData] = useState(initState.saveFirmwareData);
  const [spinning, setSpinning] = useState(true);

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    apis.firmware
      .list(encodeQueryParam(params))
      .then((response: any) => {
        if (response.status === 200) {
          setFirmwareData(response.result);
        }
        setSpinning(false);
      })
      .catch(() => {});
  };

  useEffect(() => {
    apis.deviceProdcut
      .queryNoPagin({
        paging: false
      })
      .then(response => {
        setProductList(response.result);
      })
      .catch(() => {});
    handleSearch(searchParam);
  }, []);

  const handleDelete = (params: FirmwareData) => {
    apis.firmware
      .remove(params.id)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const handleSave = (item: any) => {
    apis.firmware
      .saveOrUpdate(item)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const columns: ColumnProps<FirmwareData>[] = [
    {
      title: '????????????',
      dataIndex: 'name',
    },
    {
      title: '????????????',
      dataIndex: 'version',
    },
    {
      title: '????????????',
      dataIndex: 'productName',
    },
    {
      title: '????????????',
      dataIndex: 'signMethod',
    },
    {
      title: '????????????',
      dataIndex: 'createTime',
      width: '200px',
      align: 'center',
      render: (text: any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '??????',
      width: '300px',
      align: 'center',
      render: (record: FirmwareData) => (
        <Fragment>
          <a
            onClick={() => {
              router.push(`/device/firmware/save/${record.id}`);
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setSaveFirmwareData(record);
              setSaveVisible(true);
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="???????????????"
            onConfirm={() => {
              handleDelete(record);
            }}
          >
            <a>??????</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<FirmwareData>,
  ) => {
    setSpinning(true);
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam.terms,
      sorts: sorter,
    });
  };

  return (
    <PageHeaderWrapper title="????????????">
      <Spin spinning={spinning}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div>
              <SearchForm
                search={(params: any) => {
                  setSpinning(true);
                  handleSearch({
                    terms: params,
                    pageSize: 10,
                    sorts: searchParam.sorts,
                  });
                }}
                formItems={[
                  {
                    label: '????????????',
                    key: 'name$LIKE',
                    type: 'string',
                  },
                  {
                    label: '????????????',
                    key: 'productId',
                    type: 'list',
                    props: {
                      data: productList,
                      mode: 'tags',
                    },
                  },
                ]}
              />
            </div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setSaveFirmwareData({});
                  setSaveVisible(true);
                }}
              >
                ??????
              </Button>
            </div>
            <div className={styles.StandardTable}>
              <Table
                loading={props.loading}
                dataSource={(firmwareData || {}).data}
                columns={columns}
                rowKey="id"
                onChange={onTableChange}
                pagination={{
                  current: firmwareData?.pageIndex + 1,
                  total: firmwareData?.total,
                  pageSize: firmwareData?.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total: number) =>
                    `??? ${total} ????????? ???  ${firmwareData?.pageIndex + 1}/${Math.ceil(
                      firmwareData?.total / firmwareData?.pageSize,
                    )}???`,
                }}
              />
            </div>
          </div>
        </Card>
      </Spin>
      {saveVisible && (
        <Save
          data={saveFirmwareData}
          close={() => {
            setSaveVisible(false);
            setSpinning(true);
            handleSearch(searchParam);
          }}
          save={(item: any) => {
            setSaveVisible(false);
            setSpinning(true);
            handleSave(item);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};
export default Form.create<Props>()(Firmware);
