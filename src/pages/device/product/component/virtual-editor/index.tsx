import React, { useState } from 'react';
// import MonacoEditor from 'react-monaco-editor';
import styles from './index.less';
import { MoreOutlined } from '@ant-design/icons';
import { Drawer, Dropdown, Icon, Menu, Tooltip } from 'antd';
import MagnifyComponent from './magnify';
import QuickInsertComponent from './quick-insert';
import AceEditor from "react-ace";

interface Props {
    data: any;
    metaDataList: any[];
    scriptValue: Function;
    formData: any;
}

const VirtualEditorComponent: React.FC<Props> = props => {

    const [isMagnify, setIsMagnify] = useState<boolean>(false);
    const [isQuickInsert, setIsQuickInsert] = useState<boolean>(false);
    const [isAssign, setIsAssign] = useState<boolean>(false);
    const [editor, setEditor] = useState<any>(null);
    const [script, setScript] = useState(props.data.expands?.virtualRule?.script || '');
    const symbolList = [
        {
            key: 'add',
            value: '+'
        },
        {
            key: 'subtract',
            value: '-'
        },
        {
            key: 'multiply',
            value: '*'
        },
        {
            key: 'divide',
            value: '/'
        }, {
            key: 'parentheses',
            value: '()'
        },
        {
            key: 'cubic',
            value: '^'
        }
    ]
    const otherSymbolList = [
        {
            key: 'dayu',
            value: '>'
        },
        {
            key: 'dayudengyu',
            value: '>='
        },
        {
            key: 'dengyudengyu',
            value: '=='
        },
        {
            key: 'xiaoyudengyu',
            value: '<='
        }, {
            key: 'xiaoyu',
            value: '<'
        },
        {
            key: 'jiankuohao',
            value: '<>'
        },
        {
            key: 'andand',
            value: '&&'
        },
        {
            key: 'huohuo',
            value: '||'
        },
        {
            key: 'fei',
            value: '!'
        },
        {
            key: 'and',
            value: '&'
        },
        {
            key: 'huo',
            value: '|'
        },
        {
            key: 'bolang',
            value: '~'
        }
    ]
    const insertContent = (content: string) => {
        const cursorPosition = editor.getCursorPosition();
        editor.session.insert(cursorPosition, content);
    }
    return (
        <div className={styles.editorBox}>
            <div className={styles.editorTop}>
                <div className={styles.topLeft}>
                    {symbolList.map((item, index) => (
                        <span key={item.key} onClick={() => {
                            insertContent(symbolList[index].value)
                        }}>{item.value}</span>
                    ))}
                    <span>
                        <Dropdown overlay={() => (
                            <Menu>
                                {
                                    otherSymbolList.map((item, index) => (
                                        <Menu.Item key={item.key} onClick={() => {
                                            insertContent(otherSymbolList[index].value)
                                        }}>{item.value}</Menu.Item>
                                    ))
                                }
                            </Menu>
                        )}>
                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                <MoreOutlined />
                            </a>
                        </Dropdown>
                    </span>
                </div>
                <div className={styles.topRight}>
                    <span onClick={() => {
                        setIsAssign(true);
                        setIsMagnify(true);
                    }}><Tooltip title="????????????"><a>????????????</a></Tooltip></span>
                    <span onClick={() => {
                        setIsQuickInsert(true);
                    }}><Tooltip title="????????????"><a>????????????</a></Tooltip></span>
                    <span onClick={() => {
                        setIsAssign(false);
                        setIsMagnify(true);
                    }}><Icon type="fullscreen" /></span>
                </div>
            </div>
            <AceEditor
                ref={l => setEditor(l && l.editor)}
                mode='groovy'
                theme="eclipse"
                name="app_code_editor"
                key='simulator'
                fontSize={14}
                value={script}
                showPrintMargin
                showGutter
                wrapEnabled
                highlightActiveLine  //???????????????
                enableSnippets  //???????????????
                style={{ height: 300 }}
                onChange={(value) => {
                    props.scriptValue(value);
                    setScript(value);
                }}
                setOptions={{
                    enableBasicAutocompletion: true,   //??????????????????????????????
                    enableLiveAutocompletion: true,   //?????????????????????????????? ?????????????????????????????????
                    enableSnippets: true,  //???????????????
                    showLineNumbers: true,
                    tabSize: 2,
                }}
            />
            {/* <MonacoEditor
                // ref={l => setEditor(l && l.editor)}
                height="300"
                language='groovy'
                theme='vs'
                value={'test'}
                options={{
                    selectOnLineNumbers: true
                }}
                // onChange={(value) => {
                //     props.scriptValue(value);
                //     setScript(value);
                // }}
                editorDidMount={(editor, monaco) => editorDidMountHandle(editor, monaco)}
            /> */}
            {isMagnify && (
                <MagnifyComponent formData={
                    props.formData
                }metaDataList={props.metaDataList} data={{
                    isAssign: isAssign,
                    script: script,
                    ...props.data
                }} close={(data: any) => { setIsMagnify(false); setScript(data) }} />
            )}
            <Drawer title="????????????" visible={isQuickInsert} width={400} onClose={() => { setIsQuickInsert(false); }}>
                <QuickInsertComponent insertContent={(data: string) => { insertContent(data) }} metaDataList={props.metaDataList} close={() => { setIsQuickInsert(false); }} />
            </Drawer>
        </div>
    );
}

export default VirtualEditorComponent;