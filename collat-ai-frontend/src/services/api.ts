import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return Promise.reject(
          new Error(
            'Cannot reach the API at http://localhost:8000. Start the FastAPI backend (uvicorn src.api:app --port 8000).',
          ),
        )
      }
      const msg =
        (error.response?.data as { detail?: string } | undefined)?.detail ??
        error.message
      return Promise.reject(new Error(typeof msg === 'string' ? msg : error.message))
    }
    return Promise.reject(error)
  },
)
