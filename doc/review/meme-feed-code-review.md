- Identify the cause of the problem and write a report in `doc/review/meme-feed-code-review.md`.

1. 
The meme feed is slow because it loads all memes, authors, and comments at once, and does it one by one. This causes many API calls and slows down the page. The solution is to load only the first page at first, and then load more as the user scrolls.

2. 
After limiting to one page of memes, we fetches meme authors and comment authors one at a time. This causes many separate API calls, especially when there are lots of comments. The solution is to load this data in parallel using Promise.all.

debug
0 
0
0
9
1
146
79
80
96
91