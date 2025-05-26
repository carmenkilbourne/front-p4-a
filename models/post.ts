import Comment from "./comments.ts";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  cover: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export default Post;
