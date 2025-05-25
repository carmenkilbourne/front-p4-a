import { Handlers, PageProps } from "$fresh/server.ts";
import axios from "axios";
import { API_BASE_URL } from "../utils/config.ts";
import { ApiResponseSuccess } from "../models/api_response.ts";
import Post from "../models/post.ts";
import { useSignal } from "@preact/signals";
import MainView from "../islands/MainView.tsx";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { data } = await axios.get<ApiResponseSuccess<Post[]>>(
        `${API_BASE_URL}/api/post`,
      );
      return ctx.render({ posts: data.data.posts });
    } catch (_) {
      return ctx.render({ posts: [] });
    }
  },
};

export default function Home(props: PageProps<{ posts: Post[] }>) {
  const isGrid = useSignal<boolean>(false);
  const { posts } = props.data;
  return (
    <div>
      <h1>Últimos posts</h1>

      {posts.length === 0
        ? (
          <div className="center">
            <p>No hay posts</p>
          </div>
        )
        : (
          <MainView isGrid={isGrid} posts={posts} />
        )}
    </div>
  );
}
