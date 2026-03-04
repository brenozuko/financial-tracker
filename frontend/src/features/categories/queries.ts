import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { categoriesApi, type CreateCategoryBody } from "./api"

// ── Query Key Factory ──────────────────────────────────────────────────────

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoriesApi.list,
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryBody) => categoriesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}
