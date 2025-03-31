import React, { useEffect, useState } from 'react';
import { List, Checkbox, Button, Modal, Form, Input, message, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { todoApi, userApi, getCurrentUser } from '../services/api';

interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [form] = Form.useForm();
  const user = getCurrentUser();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (error: any) {
      message.error(error.error || '获取待办事项失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddOrEdit = async (values: { title: string; description?: string }) => {
    try {
      if (editingTodo) {
        await todoApi.update(editingTodo.id, { ...values, completed: editingTodo.completed });
        message.success('更新成功');
      } else {
        await todoApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTodo(null);
      fetchTodos();
    } catch (error: any) {
      message.error(error.error || (editingTodo ? '更新失败' : '创建失败'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoApi.delete(id);
      message.success('删除成功');
      fetchTodos();
    } catch (error: any) {
      message.error(error.error || '删除失败');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await todoApi.update(todo.id, { completed: !todo.completed });
      fetchTodos();
    } catch (error: any) {
      message.error(error.error || '更新状态失败');
    }
  };

  const showEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue(todo);
    setModalVisible(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">待办事项</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">欢迎，{user?.name || user?.email}</span>
          <Button
            type="primary"
            onClick={() => {
              setEditingTodo(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建待办
          </Button>
          <Button
            icon={<LogoutOutlined />}
            onClick={userApi.logout}
            danger
          >
            退出登录
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <List
          className="bg-white rounded-lg shadow"
          itemLayout="horizontal"
          dataSource={todos}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(todo)}
                  type="link"
                >
                  编辑
                </Button>,
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(todo.id)}
                  type="link"
                  danger
                >
                  删除
                </Button>
              ]}
            >
              <div className="flex items-center w-full">
                <Checkbox
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                />
                <div className="ml-4 flex-1">
                  <h3 className={`text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p className={`text-sm text-gray-500 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title={editingTodo ? '编辑待办事项' : '新建待办事项'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTodo(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddOrEdit}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入待办事项标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入待办事项描述（选填）" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button type="default" onClick={() => setModalVisible(false)} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingTodo ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}; 