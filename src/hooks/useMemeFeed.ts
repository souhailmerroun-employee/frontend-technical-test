import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query"
import { getMemes, getUserById, getMemeComments } from "../api"
import { useAuthToken } from "../contexts/authentication"
import { MemePage, Meme, Comment } from "../types"

export function useMemeFeed(): UseInfiniteQueryResult<InfiniteData<MemePage>, Error> {
  const token = useAuthToken()

  return useInfiniteQuery<
    MemePage,
    Error,
    InfiniteData<MemePage>,
    [string],
  number
  >({
    queryKey: ["memes"],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const memePage = await getMemes(token, pageParam)

      const memesWithData: Meme[] = await Promise.all(
        memePage.results.map(async (meme) => {
          const [author, commentPage] = await Promise.all([
            getUserById(token, meme.authorId),
            getMemeComments(token, meme.id, 1),
          ])

          const commentsWithAuthors: Comment[] = await Promise.all(
            commentPage.results.map(async (c) => {
              const commentAuthor = await getUserById(token, c.authorId)
              return { ...c, author: commentAuthor }
            })
          )

          const numericCount =
            typeof meme.commentsCount === "string"
              ? parseInt(meme.commentsCount, 10)
              : meme.commentsCount

          return {
            ...meme,
            author,
            comments: commentsWithAuthors,
            commentsCount: numericCount || commentPage.total || 0,
          }
        })
      )

      return {
        results: memesWithData,
        hasMore: memePage.total > pageParam * memePage.pageSize,
      }
    },

    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
  })
}
