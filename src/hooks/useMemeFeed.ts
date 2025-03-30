import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getMemes,
  getUserById,
  getMemeComments,
} from "../api";
import { useAuthToken } from "../contexts/authentication";

export function useMemeFeed() {
  const token = useAuthToken();

  return useInfiniteQuery({
    queryKey: ["memes"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const memePage = await getMemes(token, pageParam);

      const memesWithData = await Promise.all(
        memePage.results.map(async (meme) => {
          const [author, commentPage] = await Promise.all([
            getUserById(token, meme.authorId),
            getMemeComments(token, meme.id, 1),
          ]);

          const commentsWithAuthors = await Promise.all(
            commentPage.results.map(async (comment) => {
              const commentAuthor = await getUserById(token, comment.authorId);
              return {
                ...comment,
                author: commentAuthor,
              };
            })
          );

          return {
            ...meme,
            author,
            comments: commentsWithAuthors,
          };
        })
      );

      return {
        results: memesWithData,
        hasMore: memePage.total > pageParam * memePage.pageSize
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
}
