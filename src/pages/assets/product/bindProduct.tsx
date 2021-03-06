import React, {useEffect, useState} from 'react';
import {FormComponentProps} from 'antd/lib/form';
import Form from 'antd/es/form';
import {Button, Drawer, message, Spin, Table} from 'antd';
import {ColumnProps, PaginationConfig, SorterResult} from "antd/lib/table";
import api from "@/services";
import encodeParam from "@/utils/encodeParam";
import Authority from "../authority/index";
import SearchForm from "@/components/SearchForm";
import {DeviceInstance} from "@/pages/device/instance/data";

interface Props extends FormComponentProps {
    targetId: string;
    targetType: string;
    close: Function;
}

const BindProduct: React.FC<Props> = props => {

    const [spinning, setSpinning] = useState(true);
    const [authority, setAuthority] = useState(false);
    const [productData, setProductData] = useState<any>({});
    const [productIdList, setProductIdList] = useState<any[]>([]);
    const [searchParam, setSearchParam] = useState<any>({
        pageSize: 10,
        terms: {},
        sorts: {
            order: 'descend',
            field: 'id',
        },
    });

    const handleSearch = (parmes: any) => {
        setSearchParam(parmes);
        parmes.terms = {
            ...parmes.terms,
            "id#dim-assets$not": `{"assetType":"product","targets":[{"type":"${props.targetType}","id":"${props.targetId}"}]}`
        };
        api.deviceProdcut
            .query(encodeParam(parmes))
            .then(res => {
                setSpinning(false);
                if (res.status === 200) {
                    setProductData(res.result);
                }
            });
    };

    useEffect(() => {
        handleSearch(searchParam);
    }, []);

    const bindProduct = (value: any) => {
        const data = [{
            "targetType": props.targetType,
            "targetId": props.targetId,
            "assetType": "product",
            "assetIdList": productIdList,
            "permission": value.permission
        }];

        api.assets.BindAssets("product",data)
            .then((result: any) => {
                if (result.status === 200) {
                    message.success("??????????????????");
                    props.close();
                } else {
                    message.error("??????????????????");
                }
            }).catch(() => {
        })
    };

    const columns: ColumnProps<any>[] = [
        {
            title: '??????ID',
            align: 'left',
            width: 150,
            dataIndex: 'id',
            ellipsis: true,
        },
        {
            title: '??????',
            align: 'left',
            dataIndex: 'key',
        },
        {
            title: '????????????',
            dataIndex: 'name',
            align: 'center',
        }
    ];

    const onTableChange = (
        pagination: PaginationConfig,
        filters: any,
        sorter: SorterResult<DeviceInstance>,
    ) => {
        let {terms} = searchParam;
        handleSearch({
            pageIndex: Number(pagination.current) - 1,
            pageSize: pagination.pageSize,
            terms,
            sorts: sorter,
        })
    };

    const rowSelection = {
        onChange: (selectedRowKeys: any) => {
            setProductIdList(selectedRowKeys);
        },
    };

    return (
        <Drawer
            visible
            title='??????????????????'
            width='50%'
            onClose={() => props.close()}
            closable
        >
            <Spin spinning={spinning}>
                <SearchForm
                    search={(params: any) => {
                        handleSearch({
                            terms: {...params},
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
                            key: 'deviceType$IN',
                            type: 'list',
                            props: {
                                data: [
                                    {id: 'device', name: '????????????'},
                                    {id: 'childrenDevice', name: '???????????????'},
                                    {id: 'gateway', name: '????????????'},
                                ],
                                mode: 'tags',
                            },
                        },
                    ]}
                />
                <Table
                    columns={columns}
                    dataSource={(productData || {}).data}
                    rowKey="id"
                    onChange={onTableChange}
                    rowSelection={{
                        type: 'checkbox',
                        ...rowSelection,
                    }}
                    pagination={{
                        current: productData.pageIndex + 1,
                        total: productData.total,
                        pageSize: productData.pageSize,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total: number) =>
                            `??? ${total} ????????? ???  ${productData.pageIndex + 1}/${Math.ceil(
                                productData.total / productData.pageSize,
                            )}???`,
                    }}
                />
            </Spin>
            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '10px 16px',
                    background: '#fff',
                    textAlign: 'right',
                }}
            >
                <Button
                    onClick={() => {
                        props.close();
                    }}
                    style={{marginRight: 8}}
                >
                    ??????
                </Button>
                {productIdList.length > 0 && <Button
                    onClick={() => {
                        setAuthority(true);
                    }}
                    type="primary"
                >
                    ??????
                </Button>}
            </div>
            {authority && <Authority close={(data: any) => {
                setAuthority(false);
                if (data) {
                    bindProduct(data);
                }
            }}/>}
        </Drawer>
    );
};

export default Form.create<Props>()(BindProduct);
