import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { ISurveyDefinition } from '../models/survey'
// import api from '../utils/api'

const API_URL = 'http://localhost:5000/api'

const initialState: { surveys: Array<ISurveyDefinition>, status: string, error: any } = {
  surveys: [],
  status: 'idle',
  error: null
}

const surveysSlice = createSlice({
  name: 'surveys',
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
      .addCase(load.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(load.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched surveys to the array
        state.surveys = state.surveys.concat(action.payload)
      })
      .addCase(load.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(get.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const survey = state.surveys.filter(s => s.id === action.payload.id)[0];
        // if (!survey) {
        //   state.surveys.push(action.payload)
        // }
        const index = state.surveys.indexOf(survey);
        // console.log('index======>>>>>>>>', survey);
        if (index < 0) {
        state.surveys.push(action.payload)
        }

      })
      .addCase(create.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add new survey to the array
        state.surveys.push(action.payload)
      })
      .addCase(remove.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Remove survey from the array
        const survey = state.surveys.filter(s => s.id === action.payload)[0];
        const index = state.surveys.indexOf(survey);
        if (index >= 0) {
          state.surveys.splice(index, 1);
        }
      })
      .addCase(update.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Update survey in the array
        const survey = state.surveys.filter(s => s.id === action.payload.id)[0];
        survey.json = action.payload.json;
      })
  }
})

export const load = createAsyncThunk('surveys/load', async () => {
  const response = await axios.get(API_URL+'/surveys')
  return response.data
})

// export const loadId = createAsyncThunk('surveys/load', async (id: string) => {
//   const response = await axios.get('/api/surveys/' + id)
//   return response.data
// })

export const get = createAsyncThunk('surveys/get', async (id: string) => {
  const response = await axios.get(API_URL+'/surveys/' + id)
  // console.log(response.data)
  return response.data
})

export const create = createAsyncThunk('surveys/create', async () => {
  const response = await axios.get(API_URL+'/surveys/create')
  return response.data
})

export const remove = createAsyncThunk('surveys/delete', async (id: string) => {
  await axios.delete(API_URL+'/surveys/' + id)
  return id
})

export const update = createAsyncThunk('surveys/update', async (data: { id: string, json: any, text: string }) => {
  const response = await axios.put(API_URL+'/surveys/changeJson', data)
  // console.log(response.data)
  return response.data
})

// export const { add, remove, update } = surveysSlice.actions
export default surveysSlice.reducer