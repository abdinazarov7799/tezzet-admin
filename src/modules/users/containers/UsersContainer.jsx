import React, {useEffect, useState} from 'react';
import Container from "../../../components/Container.jsx";
import {Button, Input, Modal, Pagination, Popconfirm, Row, Select, Space, Switch, Table} from "antd";
import {get} from "lodash";
import {useTranslation} from "react-i18next";
import usePaginateQuery from "../../../hooks/api/usePaginateQuery.js";
import {KEYS} from "../../../constants/key.js";
import {URLS} from "../../../constants/url.js";
import {EditOutlined, LockOutlined, UnlockOutlined} from "@ant-design/icons";
import usePutQuery from "../../../hooks/api/usePutQuery.js";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery.js";

const UsersContainer = () => {
    const {t} = useTranslation();
    const [page, setPage] = useState(0);
    const [searchKey,setSearchKey] = useState();
    const [selected, setSelected] = useState(null);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [searchVisitor, setSearchVisitor] = useState(null);

    const {data,isLoading} = usePaginateQuery({
        key: KEYS.users_list,
        url: URLS.users_list,
        params: {
            params: {
                size: 10,
                search: searchKey
            }
        },
        page
    });

    const {data:users,isLoading:isLoadingUsers} = useGetAllQuery({
        key: KEYS.users_list,
        url: URLS.users_list,
        params: {
            params: {
                size: 1000,
                search: searchVisitor,
            }
        },
        enabled: !!selected
    })

    useEffect(() => {
        setSelectedVisitor(get(selected,'visitor.id'))
    },[selected])

    const {mutate:block} = usePutQuery({listKeyId: KEYS.users_list})
    const {mutate:edit} = usePutQuery({listKeyId: KEYS.users_list})

    const useBlock = (id,isBlock) => {
        block({url: `${URLS.user_block}/${id}?ban=${isBlock}`})
    }

    const options = Array.isArray(get(users,'data.content')) ?
        get(users,'data.content')?.map((user) => ({label: get(user,'phoneNumber'), value: get(user,'id')}))
        : [];

    const editVisitor = () => {
        edit({url: `${URLS.user_edit_visitor}/${get(selected,'id')}/${selectedVisitor}`},{
            onSuccess: () => {
                setSelected(null)
                setSearchVisitor(null)
                setSelectedVisitor(null)
            }
        })
    }

    const columns = [
        {
            title: t("ID"),
            dataIndex: "id",
            key: "id",
        },
        {
            title: t("Chat id"),
            dataIndex: "chatId",
            key: "chatId"
        },
        {
            title: t("Username"),
            dataIndex: "username",
            key: "username"
        },
        {
            title: t("Phone number"),
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: t("Visitor"),
            dataIndex: "visitor",
            key: "visitor",
            render: (props) => get(props,'phoneNumber')
        },
        {
            title: t("Edit Visitor"),
            key: "editVisitor",
            width: 100,
            render: (props) => {
                return (
                    <Button block icon={<EditOutlined />} onClick={() => {
                        setSelected(props)
                    }} />
                )
            }
        },
        {
            title: t("Registered"),
            dataIndex: "registered",
            key: "registered",
            render: (props,data) => {
                return (
                    <Switch disabled value={get(data,'registered')}/>
                )
            }
        },
        {
            title: t("Banned"),
            dataIndex: "banned",
            key: "banned",
            render: (props,data) => {
                return (
                    <Switch disabled value={get(data,'banned')}/>
                )
            }
        },
        {
            title: t("Ban / Un ban"),
            width: 120,
            fixed: 'right',
            key: 'action',
            render: (props, data) => {
                return (
                    <Space>
                        <Popconfirm
                            title={t("Ban")}
                            description={t("Are you sure to ban?")}
                            onConfirm={() => useBlock(get(data,'id'),true)}
                            okText={t("Yes")}
                            cancelText={t("No")}
                        >
                            <Button danger icon={<LockOutlined />}/>
                        </Popconfirm>
                        <Popconfirm
                            title={t("Un ban")}
                            description={t("Are you sure to unban?")}
                            onConfirm={() => useBlock(get(data,'id'),false)}
                            okText={t("Yes")}
                            cancelText={t("No")}
                        >
                            <Button type={"primary"} icon={<UnlockOutlined />}/>
                        </Popconfirm>
                    </Space>
                )
            }
        }
    ]
    return (
        <Container>
            <Space direction={"vertical"} style={{width: "100%"}} size={"middle"}>
                <Space size={"middle"}>
                    <Input.Search
                        placeholder={t("Search")}
                        onChange={(e) => setSearchKey(e.target.value)}
                        allowClear
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={get(data,'data.content',[])}
                    bordered
                    size={"middle"}
                    pagination={false}
                    loading={isLoading}
                />

                <Row justify={"end"} style={{marginTop: 10}}>
                    <Pagination
                        current={page+1}
                        onChange={(page) => setPage(page - 1)}
                        total={get(data,'data.totalPages') * 10 }
                        showSizeChanger={false}
                    />
                </Row>
            </Space>

            <Modal
                title={t("Edit visitor")}
                footer={null}
                open={!!selected}
                onCancel={() => setSelected(null)}
            >
                <Space direction={"vertical"} size={"middle"} style={{width:'100%'}}>
                    <Select
                        style={{width: "100%"}}
                        options={options}
                        onChange={(value) => setSelectedVisitor(value)}
                        loading={isLoadingUsers}
                        value={selectedVisitor}
                        showSearch
                        searchValue={searchVisitor}
                        onSearch={value => setSearchVisitor(value)}
                    />

                    <Button type={"primary"} block onClick={editVisitor}>
                        {t("Edit")}
                    </Button>
                </Space>

            </Modal>
        </Container>
    );
};

export default UsersContainer;
