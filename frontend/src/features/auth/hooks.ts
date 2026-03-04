import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { authApi } from "./api"
import type { LoginRequest, RegisterRequest } from "./types"

export function useRegister() {
  const router = useRouter()
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token)
      router.navigate({ to: "/" })
    },
  })
}

export function useLogin() {
  const router = useRouter()
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token)
      router.navigate({ to: "/" })
    },
  })
}

export function useDeleteMe() {
  const router = useRouter()
  return useMutation({
    mutationFn: () => authApi.deleteMe(),
    onSuccess: () => {
      localStorage.removeItem("token")
      router.navigate({ to: "/auth/login" })
    },
  })
}
