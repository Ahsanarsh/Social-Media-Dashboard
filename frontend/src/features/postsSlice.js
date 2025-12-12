import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

// Fetch Feed
export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);

// Fetch Explore
export const fetchExplore = createAsyncThunk(
  "posts/fetchExplore",
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/explore?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);

// Create Post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      // formData should be FormData object
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Create failed");
    }
  }
);

// Like Post
export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.post(`/posts/${postId}/like`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Like failed");
    }
  }
);

// Unlike Post (assuming you implement DELETE or toggle in backend, if not adapted here)
export const unlikePost = createAsyncThunk(
  "posts/unlikePost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/like`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unlike failed");
    }
  }
);

// Repost Post
export const repostPost = createAsyncThunk(
  "posts/repostPost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.post(`/posts/${postId}/repost`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Repost failed");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        // If page 1, replace. If page > 1, append. (Simplified for now)
        // Adjust logic if pagination is handled in component
        if (action.meta.arg.page === 1) {
          state.posts = action.payload.data;
        } else {
          state.posts = [...state.posts, ...action.payload.data];
        }
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Explore
      .addCase(fetchExplore.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExplore.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 1) {
          state.posts = action.payload.data;
        } else {
          state.posts = [...state.posts, ...action.payload.data];
        }
      })
      .addCase(fetchExplore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        const newPost = action.payload.data;
        state.posts.unshift(newPost);
      })
      // Like Post (Optimistic Update could be here, but simpler to just update state)
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) {
          post.likes_count += 1;
          post.is_liked = true;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) {
          post.likes_count -= 1;
          post.is_liked = false;
        }
      })
      // Repost
      .addCase(repostPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) {
          post.reposts_count = (parseInt(post.reposts_count) || 0) + 1;
          post.is_reposted = true;
        }
      });
  },
});

export default postsSlice.reducer;
