/**
 * Pagination information for cursor-based pagination.
 */
export type IGPagination = {
  cursor?: string | null;
  hasNextPage: boolean;
};

/**
 * Paged result structure for list operations.
 *
 * @template TItem - The item type in the list
 */
export type IGPagedResult<TItem> = {
  items: TItem[];
  page: IGPagination;
};
