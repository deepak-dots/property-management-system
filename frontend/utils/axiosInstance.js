// utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', 
  //baseURL: 'http://192.168.1.50:3000/api', // Use PC IP + backend port
  withCredentials: true,
});

export default instance;
