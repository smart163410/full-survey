import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReduxDispatch, useReduxSelector } from '../redux'
import { load } from '../redux/results';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// material-ui
// import { useTheme } from '@mui/material/styles';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';

import MainCard from '../components/MainCard';

import OrdersList from '../sections/dashboard/analytics/OrdersList';
import SalesChart from '../sections/dashboard/SalesChart';
// import { useSelector, useDispatch } from 'react-redux'
// import Spinner from '../components/Spinner'
// import { RootState } from '../redux'

const parseCSV = (csvData: string): any => {
  const parsed = Papa.parse(csvData, { header: true });
  return parsed.data;
};


const Dashboard = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const { user } = useReduxSelector((state) => state.auth);
  const dispatch = useReduxDispatch();
  const postStatus = useReduxSelector(state => state.surveys.status);
  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user) {
            navigate('/login');
    }
  }, [user, navigate])

  // useEffect(() => {
  //   if (postStatus === 'idle' && id)
  //     dispatch(load(id));

  // }, [])


  const [data, setData] = useState([]);
   useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('./download-10.xls');
      const text = await response.text();
      const parsedData = parseCSV(text);
      setData(parsedData);
      console.log(parsedData)
    };
    fetchData();
  }, []);
   return (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>{row.name}</div>
      ))}
    </div>
  );
};


export default Dashboard
