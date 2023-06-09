import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// import api from '../utils/api'
import axios from 'axios'
import setAuthToken from '../utils/setAuthToken';
const API_URL = 'http://localhost:5000/api'

export const load = createAsyncThunk('results/load', async (id: string) => {
  // const response = await api.get('/results?postId=' + id)
  await setAuthToken();
  const response = await axios.get(API_URL + '/posts/calc/' + id)
  return response.data
})

export const loadAll = createAsyncThunk('results/loadAll', async (id: string) => {
  // const response = await api.get('/results?postId=' + id)
  await setAuthToken();
  const response = await axios.post(API_URL+'/posts/surveyallresults/' + id)
  return response.data
})

export const post = createAsyncThunk('results/post', async (data: { postId: string, surveyResult: any, surveyResultText: string }) => {
  await setAuthToken();
  const response = await axios.post(API_URL+'/posts', data);
  return response.data
})

interface ResultsData {
  cellWeighting: Array<number>;
  linearReg: Array<number>;
  logisticReg: Array<number>;
  rakingMethod: Array<number>;
}

const initialState: { results: ResultsData, status: string, error: any, surveyallresults: any } = {
  results: {
    cellWeighting: [0, 0],
    linearReg: [0, 0],
    logisticReg: [0, 0],
    rakingMethod: [0, 0]
  },
  status: 'idle',
  error: null,
  surveyallresults: []
}

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    // add: (state, action: PayloadAction<void>) => {
    //     state.surveys.push(getDefaultJSON());
    // },
    // remove: (state, action: PayloadAction<string>) => {
    //     const survey = state.surveys.filter(s => s.id === action.payload)[0];
    //     const index = state.surveys.indexOf(survey);
    //     if(index >= 0) {
    //         state.surveys.splice(index, 1);
    //     }
    // },
    // update: (state, action: PayloadAction<{id: string, json: any}>) => {
    //     const survey = state.surveys.filter(s => s.id === action.payload.id)[0];
    //     survey.json = action.payload.json;
    // },
  },
  extraReducers(builder) {
    builder
      .addCase(load.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched surveys to the array
        state.results = action.payload
      })
      .addCase(loadAll.fulfilled, (state, action) => {
        // state.status = 'succeeded'
        // Add any fetched surveys to the array
        state.surveyallresults = action.payload
        // console.log(action.payload)
      })
  }
})



export default resultsSlice.reducer