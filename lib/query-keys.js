// Central cache invalidation for anything that changes visit data.
// Invalidation (unlike queryClient.clear()) keeps current data on screen,
// marks it stale, and refetches active queries immediately — so open
// drawers/popups update in place instead of flashing empty.
export function invalidateVisitData(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['countries-aggregate'] }),
    queryClient.invalidateQueries({ queryKey: ['country'] }),
    queryClient.invalidateQueries({ queryKey: ['restaurants-index'] })
  ])
}
