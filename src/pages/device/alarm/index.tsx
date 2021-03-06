import React, { Fragment, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
} from 'antd';
import apis from '@/services';
import { ColumnProps, SorterResult } from 'antd/es/table';
import { alarm, AlarmLog } from '@/pages/device/alarm/data';
import moment from 'moment';
import Save from '@/pages/device/alarm/save';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { PaginationConfig } from 'antd/lib/table';
import encodeQueryParam from '@/utils/encodeParam';
import styles from '@/utils/table.less';

interface Props extends FormComponentProps {
  target: string;
  targetId?: string;
  metaData?: string;
  name?: string;
  productId?: string;
  productName?: string;
}

interface State {
  data: any[];
  saveAlarmData: Partial<alarm>;
  searchParam: any;
  alarmLogData: any;
  alarmDataList: any[];
}

const Alarm: React.FC<Props> = props => {
  const {
    form: { getFieldDecorator },
    form,
  } = props;

  const initState: State = {
    data: [],
    saveAlarmData: {},
    searchParam: {
      pageSize: 10,
      sorts: {
        order: 'descend',
        field: 'alarmTime',
      },
    },
    alarmLogData: {},
    alarmDataList: [],
  };

  const [data, setData] = useState(initState.data);
  const [spinning, setSpinning] = useState(true);
  const [saveVisible, setSaveVisible] = useState(false);
  const [solveVisible, setSolveVisible] = useState(false);
  const [saveAlarmData, setSaveAlarmData] = useState(initState.saveAlarmData);
  const [alarmActiveKey, setAlarmActiveKey] = useState('');
  const [alarmLogId, setAlarmLogId] = useState<any>(null);
  const [solveAlarmLogId, setSolveAlarmLogId] = useState();
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [alarmLogData, setAlarmLogData] = useState(initState.alarmLogData);
  const [alarmDataList, setAlarmDataList] = useState(initState.alarmDataList);

  const statusMap = new Map();
  statusMap.set('?????????', 'success');
  statusMap.set('?????????', 'error');

  const getProductAlarms = () => {
    alarmDataList.splice(0, alarmDataList.length);
    apis.deviceAlarm
      .getProductAlarms(props.target, props.targetId)
      .then((response: any) => {
        if (response.status === 200) {
          setData(response.result);
          response.result.map((item: any) => {
            alarmDataList.push(item);
          });
          setAlarmDataList([...alarmDataList]);
        }
        setSpinning(false);
      })
      .catch(() => {});

    if (props.target === 'device') {
      apis.deviceAlarm
        .getProductAlarms('product', props.productId)
        .then((response: any) => {
          if (response.status === 200) {
            response.result.map((item: any) => {
              alarmDataList.push(item);
            });
            setAlarmDataList([...alarmDataList]);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    setAlarmActiveKey('info');
    getProductAlarms();
  }, []);

  const submitData = (data: any) => {
    apis.deviceAlarm
      .saveProductAlarms(props.target, props.targetId, data)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          setSaveVisible(false);
          getProductAlarms();
        }
        setSpinning(false);
      })
      .catch(() => {});
  };

  const _start = (item: alarm) => {
    apis.deviceAlarm
      ._start(item.id)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          getProductAlarms();
        } else {
          setSpinning(false);
        }
      })
      .catch();
  };

  const _stop = (item: any) => {
    apis.deviceAlarm
      ._stop(item.id)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          getProductAlarms();
        } else {
          setSpinning(false);
        }
      })
      .catch();
  };

  const deleteAlarm = (id: string) => {
    apis.deviceAlarm
      .remove(id)
      .then((response: any) => {
        if (response.status === 200) {
          getProductAlarms();
        } else {
          setSpinning(false);
        }
      })
      .catch(() => {});
  };

  const columns: ColumnProps<alarm>[] = [
    {
      title: '????????????',
      dataIndex: 'name',
    },
    {
      title: '????????????',
      dataIndex: 'createTime',
      render: (text: any) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/'),
    },
    {
      title: '????????????',
      dataIndex: 'state',
      render: record =>
        record ? <Badge status={statusMap.get(record.text)} text={record.text} /> : '',
    },
    {
      title: '??????',
      width: '250px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a
            onClick={() => {
              setSaveAlarmData(record);
              setSaveVisible(true);
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setAlarmLogId(record.id);
              setAlarmActiveKey('logList');
            }}
          >
            ????????????
          </a>
          <Divider type="vertical" />
          {record.state?.value === 'stopped' ? (
            <span>
              <Popconfirm
                title="????????????????????????"
                onConfirm={() => {
                  setSpinning(true);
                  _start(record);
                }}
              >
                <a>??????</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm
                title="????????????????????????"
                onConfirm={() => {
                  setSpinning(true);
                  deleteAlarm(record.id);
                }}
              >
                <a>??????</a>
              </Popconfirm>
            </span>
          ) : (
            <Popconfirm
              title="????????????????????????"
              onConfirm={() => {
                setSpinning(true);
                _stop(record);
              }}
            >
              <a>??????</a>
            </Popconfirm>
          )}
        </Fragment>
      ),
    },
  ];

  const alarmLogColumns: ColumnProps<AlarmLog>[] = [
    {
      title: '??????ID',
      dataIndex: 'deviceId',
    },
    {
      title: '????????????',
      dataIndex: 'deviceName',
    },
    {
      title: '????????????',
      dataIndex: 'alarmName',
    },
    {
      title: '????????????',
      dataIndex: 'alarmTime',
      width: '300px',
      render: (text: any) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/'),
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '????????????',
      dataIndex: 'state',
      align: 'center',
      width: '100px',
      render: text =>
        text === 'solve' ? <Tag color="#87d068">?????????</Tag> : <Tag color="#f50">?????????</Tag>,
    },
    {
      title: '??????',
      width: '120px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a
            onClick={() => {
              let content: string;
              try {
                content = JSON.stringify(record.alarmData, null, 2);
              } catch (error) {
                content = record.alarmData;
              }
              Modal.confirm({
                width: '40VW',
                title: '????????????',
                content: (
                  <pre>
                    {content}
                    {record.state === 'solve' && (
                      <>
                        <br />
                        <br />
                        <span style={{ fontSize: 16 }}>???????????????</span>
                        <br />
                        <p>{record.description}</p>
                      </>
                    )}
                  </pre>
                ),
                okText: '??????',
                cancelText: '??????',
              });
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          {record.state !== 'solve' && (
            <a
              onClick={() => {
                setSolveAlarmLogId(record.id);
                setSolveVisible(true);
              }}
            >
              ??????
            </a>
          )}
        </Fragment>
      ),
    },
  ];

  const alarmSolve = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;

      apis.deviceAlarm
        .alarmLogSolve(solveAlarmLogId || '', fileValue.description)
        .then((response: any) => {
          if (response.status === 200) {
            message.success('????????????');
            setSolveAlarmLogId(undefined);
            setSolveVisible(false);
            handleSearch(searchParam);
          }
        })
        .catch(() => {});
    });
  };

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    apis.deviceAlarm
      .findAlarmLog(encodeQueryParam(params))
      .then((response: any) => {
        if (response.status === 200) {
          setAlarmLogData(response.result);
        }
      })
      .catch(() => {});
  };

  const onAlarmProduct = (value: string) => {
    let { terms } = searchParam;
    if (terms) {
      terms.alarmId = value;
    } else {
      terms = {
        alarmId: value,
      };
    }
    handleSearch({
      pageIndex: searchParam.pageIndex,
      pageSize: searchParam.pageSize,
      terms,
      sorts: searchParam.sorter || {
        order: 'descend',
        field: 'alarmTime',
      },
    });
  };

  useEffect(() => {
    if (alarmActiveKey === 'logList') {
      if (props.target === 'device') {
        searchParam.terms = {
          deviceId: props.targetId,
        };
        if (alarmLogId != '' && alarmLogId != null && alarmLogId) {
          searchParam.terms.alarmId = alarmLogId;
        }
      } else {
        searchParam.terms = {
          productId: props.targetId,
        };
        if (alarmLogId != '' && alarmLogId != null && alarmLogId) {
          searchParam.terms.alarmId = alarmLogId;
        }
      }
      handleSearch(searchParam);
    }
  }, [alarmActiveKey]);

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<AlarmLog>,
  ) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam.terms,
      sorts: sorter,
    });
  };

  return (
    <Spin tip="?????????..." spinning={spinning}>
      <Card>
        <Tabs
          activeKey={alarmActiveKey}
          onTabClick={(key: any) => {
            setAlarmLogId(undefined);
            setAlarmActiveKey(key);
          }}
        >
          <Tabs.TabPane tab="????????????" key="info">
            <Card
              title={
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => {
                    setSaveAlarmData({});
                    setSaveVisible(true);
                  }}
                >
                  ????????????
                </Button>
              }
              bordered={false}
            >
              <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
            </Card>
          </Tabs.TabPane>
          <Tabs.TabPane tab="????????????" key="logList">
            <div>
              <Select
                placeholder="??????????????????"
                allowClear
                style={{ width: 300 }}
                value={alarmLogId}
                onChange={(value: string) => {
                  onAlarmProduct(value);
                  setAlarmLogId(value);
                }}
              >
                {alarmDataList.length > 0 &&
                  alarmDataList.map(item => (
                    <Select.Option key={item.id}>{item.name}</Select.Option>
                  ))}
              </Select>
            </div>
            <div className={styles.StandardTable} style={{ marginTop: 10 }}>
              <Table
                dataSource={alarmLogData.data}
                columns={alarmLogColumns}
                rowKey="id"
                onChange={onTableChange}
                pagination={{
                  current: alarmLogData.pageIndex + 1,
                  total: alarmLogData.total,
                  pageSize: alarmLogData.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total: number) =>
                    `??? ${total} ????????? ???  ${alarmLogData.pageIndex + 1}/${Math.ceil(
                      alarmLogData.total / alarmLogData.pageSize,
                    )}???`,
                }}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {saveVisible && (
        <Save
          close={() => {
            setSaveAlarmData({});
            setSaveVisible(false);
            getProductAlarms();
          }}
          save={(data: any) => {
            setSpinning(true);
            submitData(data);
          }}
          data={saveAlarmData}
          targetId={props.targetId}
          target={props.target}
          metaData={props.metaData}
          name={props.name}
          productName={props.productName}
          productId={props.productId}
        />
      )}

      {solveVisible && (
        <Modal
          title="??????????????????"
          visible
          okText="??????"
          cancelText="??????"
          width="700px"
          onOk={() => {
            alarmSolve();
          }}
          onCancel={() => {
            setSolveVisible(false);
            setSolveAlarmLogId(undefined);
          }}
        >
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} key="solve_form">
            <Form.Item key="description" label="????????????">
              {getFieldDecorator('description', {
                rules: [
                  { required: true, message: '?????????????????????' },
                  { max: 2000, message: '?????????????????????2000?????????' },
                ],
              })(<Input.TextArea rows={8} placeholder="?????????????????????" />)}
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Spin>
  );
};
export default Form.create<Props>()(Alarm);
