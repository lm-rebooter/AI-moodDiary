import axios from "axios";
import { Toast } from "antd-mobile";

// 不需要 token 的请求路径
const publicPaths = ["/auth/login", "/auth/register"];

// 创建 axios 实例
const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 检查是否是公开路径
    const isPublicPath = publicPaths.some((path) => config.url?.includes(path));

    if (!isPublicPath) {
      // 从 localStorage 获取 token
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          Toast.show({
            icon: 'fail',
            content: data.error || '请求参数错误'
          });
          break;
        case 401:
          Toast.show({
            icon: 'fail',
            content: '登录已过期，请重新登录'
          });
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          Toast.show({
            icon: 'fail',
            content: '没有权限访问'
          });
          break;
        case 404:
          Toast.show({
            icon: 'fail',
            content: '请求的资源不存在'
          });
          break;
        case 500:
          Toast.show({
            icon: 'fail',
            content: data.error || '服务器内部错误'
          });
          break;
        default:
          Toast.show({
            icon: 'fail',
            content: '网络错误，请稍后重试'
          });
      }
    } else if (error.request) {
      Toast.show({
        icon: 'fail',
        content: '网络连接失败，请检查网络'
      });
    } else {
      Toast.show({
        icon: 'fail',
        content: '请求发送失败'
      });
    }

    return Promise.reject(error);
  }
);

const token = localStorage.getItem("token");
if (token) {
  const decoded = JSON.parse(atob(token.split(".")[1]));
  console.log("Token中的用户信息:", decoded);
}

export default request;
