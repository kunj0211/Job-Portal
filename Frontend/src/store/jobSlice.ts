import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../api/jobService';

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Internship';
  description: string;
  salaryRange?: string;
  experience?: string;
  recruiterId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
};

export const fetchRecruiterJobs = createAsyncThunk('jobs/fetchRecruiterJobs', async (_, { rejectWithValue }) => {
  try {
    const data = await jobService.getRecruiterJobs();
    return data.jobs as Job[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch jobs');
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData: Job, { rejectWithValue }) => {
  try {
    const data = await jobService.createJob(jobData);
    return data.job as Job;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create job');
  }
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, jobData }: { id: string, jobData: Partial<Job> }, { rejectWithValue }) => {
  try {
    const data = await jobService.updateJob(id, jobData);
    return data.job as Job;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id: string, { rejectWithValue }) => {
  try {
    await jobService.deleteJob(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to delete job');
  }
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecruiterJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterJobs.fulfilled, (state, action) => {
        state.jobs = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecruiterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex((job) => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      });
  },
});

export default jobSlice.reducer;
