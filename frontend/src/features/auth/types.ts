export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterResponse {
  access_token: string
  token_type: string
  user: UserResponse
}

export interface UserResponse {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}
