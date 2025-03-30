import { useQuery } from "@tanstack/react-query";
import { getMemes, getUserById, getMemeComments, GetMemesResponse, GetMemeCommentsResponse, GetUserByIdResponse } from "../api";
import { useAuthToken } from "../contexts/authentication";

export function useMemeFeed() {
  const token = useAuthToken();

  return useQuery({
    queryKey: ["memes"],
    queryFn: async () => {
      const memes: GetMemesResponse["results"] = [];
      const firstPage = await getMemes(token, 1);
      memes.push(...firstPage.results);

      const memesWithAuthorAndComments = await Promise.all(
        memes.map(async (meme) => {
          const [author, commentPage] = await Promise.all([
            getUserById(token, meme.authorId),
            getMemeComments(token, meme.id, 1),
          ]);

          const commentAuthors = await Promise.all(
            commentPage.results.map((comment) =>
              getUserById(token, comment.authorId)
            )
          );

          const commentsWithAuthor = commentPage.results.map((comment, i) => ({
            ...comment,
            author: commentAuthors[i],
          }));

          return {
            ...meme,
            author,
            comments: commentsWithAuthor,
          };
        })
      );

      return memesWithAuthorAndComments;
    },
  });
}
