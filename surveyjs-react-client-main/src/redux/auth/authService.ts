import axios from 'axios'
// import api from '../../utils/api';
import setAuthToken from '../../utils/setAuthToken';

const API_URL = 'http://localhost:5000/api'

interface UserData {
  name: string;
  email: string;
  password: string;
}

interface User {
  email: string;
  password: string;
}

// interface UserResponseData {
//   // Define any properties that you expect to receive back from the server.
//   id: string;
//   name: string;
//   email: string;
// }

// Register user
const register = async (userData: UserData) => {
  const response = await axios.post(API_URL + '/users', userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
    localStorage.setItem('token', response.data.token)
    setAuthToken()
    // setAuthToken(JSON.stringify(response.data))
  }

  return response.data
}

// Login user
const login = async (userData: User) => {
  const response = await axios.post(API_URL + '/auth', userData)
  console.log(response);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
    localStorage.setItem('token', response.data.token)
    setAuthToken()
    // setAuthToken(JSON.stringify(response.data))
  }

  return response.data
}

// Logout user
const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  setAuthToken()

}

const authService = {
  register,
  logout,
  login,
}

export default authService
