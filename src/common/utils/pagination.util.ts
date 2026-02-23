export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getPaginationParams(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  const parsedPage = Math.max(1, parseInt(String(page || 1)));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20))));

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
}

export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function getSkipTake(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}