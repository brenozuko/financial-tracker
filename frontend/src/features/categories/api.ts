import { apiClient } from "@/lib/api-client"
import type { Category } from "@/types/api"

export interface CreateCategoryBody {
  name: string
  color: string
}

export interface UpdateCategoryBody {
  name?: string
  color?: string
}

export const categoriesApi = {
  list() {
    return apiClient.get<Category[]>("/categories/").then((r) => r.data)
  },

  create(body: CreateCategoryBody) {
    return apiClient
      .post<Category>("/categories/", body)
      .then((r) => r.data)
  },

  update(id: string, body: UpdateCategoryBody) {
    return apiClient
      .patch<Category>(`/categories/${id}`, body)
      .then((r) => r.data)
  },

  delete(id: string) {
    return apiClient.delete(`/categories/${id}`).then(() => undefined)
  },
}
