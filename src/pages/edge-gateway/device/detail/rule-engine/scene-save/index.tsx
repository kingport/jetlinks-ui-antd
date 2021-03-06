import React, {useEffect, useState} from 'react';
import Form from 'antd/es/form';
import {FormComponentProps} from 'antd/lib/form';
import {Button, Card, Col, Icon, Input, Modal, Row, Switch, Tooltip} from 'antd';
import {SceneItem} from './data';
import Trigger from './Triggers';
import ActionAssembly from './action';
import Service from "../service";

interface Props extends FormComponentProps {
  deviceId: string;
  close: Function;
  save: Function;
  data: any;
}

interface State {
  data: Partial<SceneItem>;
  triggers: any[];
  action: any[];
  parallel: boolean;
}

const SceneSave: React.FC<Props> = props => {
  const service = new Service('rule-engine');
  const modelMeta = props.data.modelMeta ? JSON.parse(props.data.modelMeta) : {};
  const initState: State = {
    data: {},
    parallel: modelMeta?.parallel || false,
    triggers: [],
    action: []
  };

  const [data, setData] = useState(initState.data);
  const [triggers, setTriggers] = useState(initState.triggers);
  const [action, setAction] = useState(initState.action);
  const [parallel, setParallel] = useState(initState.parallel);

  const submitData = () => {
    let tri = triggers.map(item => {
      if (item.trigger === 'scene') {
        return {scene: item.scene, trigger: 'scene'}
      } else if (item.trigger === 'manual') {
        return {
          trigger: 'manual'
        }
      } else if (item.trigger === 'timer') {
        return {cron: item.cron, trigger: 'timer'}
      } else {
        return {device: item.device, trigger: 'device'}
      }
    });
    let items = {
      name: data.name,
      id: data.id,
      triggers: tri,
      actions: action,
      parallel: parallel
    };
    props.save(items);
  };

  useEffect(() => {
    if (props.data.id) {
      service.getSceneInfo(props.deviceId, {id: props.data.id}).subscribe(
        (res) => {
          setData(res);
          setParallel(res.parallel);
          if (res.triggers && res.triggers.length > 0) {
            setTriggers(res.triggers)
          } else {
            setTriggers(
              [
                {
                  _id: Math.round(Math.random() * 100000),
                  trigger: '', cron: '',
                  device: {
                    shakeLimit: {enabled: false},
                    filters: [{_id: Math.round(Math.random() * 100000), key: '', value: '', operator: ''}],
                    productId: '',
                    deviceId: '',
                    type: '',
                    modelId: ''
                  },
                  scene: {sceneIds: []}
                }
              ],
            )
          }
          if (res.actions && res.actions.length > 0) {
            setAction(res.actions)
          } else {
            setAction(
              [
                {executor: ''}
              ]
            )
          }
        },
        () => {
        },
        () => {})
    } else {
      setData({id: '', name: ''});
      setParallel(false);
      setTriggers(
        [
          {
            _id: Math.round(Math.random() * 100000),
            trigger: '', cron: '',
            device: {
              shakeLimit: {enabled: false},
              filters: [{_id: Math.round(Math.random() * 100000), key: '', value: '', operator: ''}],
              productId: '',
              deviceId: '',
              type: '',
              modelId: ''
            },
            scene: {sceneIds: []}
          }
        ],
      );
      setAction(
        [
          {executor: ''}
        ]
      )
    }
  }, []);

  return (
    <Modal
      title={props.data.id ? '??????????????????' : '??????????????????'}
      visible
      okText="??????"
      cancelText="??????"
      onOk={() => {
        submitData();
      }}
      style={{marginTop: '-3%'}}
      width="70%"
      onCancel={() => props.close()}
    >
      <div style={{maxHeight: 750, overflowY: 'auto', overflowX: 'hidden'}}>
        <Form wrapperCol={{span: 20}} labelCol={{span: 4}} key='addAlarmForm'>
          <Row gutter={16}
               style={{marginLeft: '0.1%'}}>
            <Col span={12}>
              <Form.Item key="id" label="????????????ID">
                <Input placeholder="??????????????????ID"
                       defaultValue={props.data.id}
                       readOnly={!!props.data.id}
                       onBlur={event => {
                         setData({...data, id: event.target.value})
                       }}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item key="name" label="??????????????????">
                <Input placeholder="????????????????????????"
                       defaultValue={props.data.name}
                       onBlur={event => {
                         setData({...data, name: event.target.value})
                       }}/>
              </Form.Item>
            </Col>
          </Row>
          <Card style={{marginBottom: 10}} bordered={false} size="small">
            <p style={{fontSize: 16}}>????????????
              <Tooltip title="???????????????????????????????????????????????????">
                <Icon type="question-circle-o" style={{paddingLeft: 10}}/>
              </Tooltip>
            </p>
            {triggers.length > 0 && triggers.map((item: any, index) => (
              <div key={index}>
                <Trigger
                  save={(data: any) => {
                    triggers.splice(index, 1, data);
                  }}
                  deviceId={props.deviceId}
                  key={index + Math.random()}
                  trigger={item}
                  position={index}
                  remove={(position: number) => {
                    triggers.splice(position, 1);
                    let data = [...triggers];
                    setTriggers([...data]);
                  }}
                />
              </div>
            ))}
            <Button icon="plus" type="link"
                    onClick={() => {
                      setTriggers([...triggers, {
                        _id: Math.round(Math.random() * 100000), name: '', trigger: '', cron: '',
                        device: {shakeLimit: {}, filters: [], productId: '', deviceId: '', type: '', modelId: ''},
                        scene: {}
                      }]);
                    }}
            >
              ???????????????
            </Button>
          </Card>

          <Card bordered={false} size="small">
            <p style={{fontSize: 16}}>
              <span>????????????</span>
              <Switch key='parallel'
                      checkedChildren="????????????" unCheckedChildren="????????????"
                      defaultChecked={parallel}
                      style={{marginLeft: 20, width: '100px'}}
                      onChange={(value: boolean) => {
                        setParallel(value);
                      }}
              />
            </p>
            {action.length > 0 && action.map((item: any, index) => (
              <div key={index}>
                <ActionAssembly deviceId={props.deviceId} key={index + Math.random()} save={(actionData: any) => {
                  action.splice(index, 1, actionData);
                }} action={item} position={index} remove={(position: number) => {
                  action.splice(position, 1);
                  setAction([...action]);
                }}/>
              </div>
            ))}
            <Button icon="plus" type="link"
                    onClick={() => {
                      setAction([...action, {_id: Math.round(Math.random() * 100000)}]);
                    }}
            >
              ????????????
            </Button>
          </Card>
        </Form>
      </div>
    </Modal>
  );
};

export default Form.create<Props>()(SceneSave);
