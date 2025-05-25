import { Handlers } from "$fresh/server.ts";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config.ts";
import type { ApiResponseSingleSuccess } from "../../models/api_response.ts";
import type Post from "../../models/post.ts";
import PostCover from "../../islands/PostCover.tsx";
import LikeButton from "../../islands/LikeButton.tsx";

interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
}

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { data } = await axios.get<ApiResponseSingleSuccess<Post>>(
        `${API_BASE_URL}/api/posts/${ctx.params.id}`,
      );
      return ctx.render({ post: data.data });
    } catch (_) {
      return ctx.render({ post: null });
    }
  },
  
  async POST(req, ctx) {
    const form = await req.formData();
    const author = form.get('author')?.toString() || '';
    const content = form.get('content')?.toString() || '';
    
    if (!author || !content) {
      return new Response('Faltan campos requeridos', { status: 400 });
    }
    
    try {
      await axios.patch(
        `${API_BASE_URL}/api/posts/${ctx.params.id}/comments`,
        { author, content },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Redirigir a la misma página para ver el nuevo comentario
      const headers = new Headers();
      headers.set('location', `/post/${ctx.params.id}`);
      return new Response(null, {
        status: 303, // See Other
        headers,
      });
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      return new Response('Error al publicar el comentario', { status: 500 });
    }
  },
};

interface PostProps {
  data: {
    post: (Post & { comments?: Comment[] }) | null;
  };
}

export default function PostDetail({ data }: PostProps) {
  const { post } = data;
  if (!post) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
              </path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
              <circle cx="12" cy="16" r="1"></circle>
            </svg>
          </div>
          <h1>¡Ups! Post no encontrado</h1>
          <p>El post que estás buscando no existe o ha sido eliminado.</p>
          <div className="not-found-actions">
            <a href="/" className="back-home-btn">
              Volver al inicio
            </a>
            <a href="/search" className="search-link">
              Buscar posts
            </a>
          </div>
        </div>
      </div>
    );
  }
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string"
      ? new Date(dateString)
      : dateString;
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  return (
    <div className="post-detail">
      {/* Portada del post */}
      <PostCover
        src={post.portada}
        alt={`Imagen de portada para: ${post.titulo}`}
        width={1200}
        height={400}
      />

      <div className="post-container">
        {/* Cabecera del post */}
        <header className="post-header">
          <h1 className="post-title">{post.titulo}</h1>
          <div className="post-meta">
            <span className="post-author">Por {post.autor}</span>
            <span className="post-date">{formatDate(post.created_at)}</span>
          </div>
        </header>

        {/* Contenido del post */}
        <article className="post-content">
          <div className="post-text">
            {post.contenido.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>

        {/* Sección de interacción */}
        <footer className="post-footer">
          <div className="post-actions">
            <LikeButton
              postId={post._id}
              initialLikes={post.likes}
              isLiked={false}
            />
          </div>

          {/* Sección de comentarios (puedes implementarla más adelante) */}
          <section className="comments-section" aria-label="Comentarios">
            <h3>Comentarios ({post.comments?.length || 0})</h3>
            
            {/* Formulario para añadir comentario */}
            <form method="POST" className="comment-form">
              <div className="form-group">
                <label htmlFor="author">Nombre:</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  required
                  className="form-input"
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Comentario:</label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Escribe tu comentario..."
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Publicar comentario
              </button>
            </form>

            {/* Lista de comentarios */}
            <div className="comments-list-container">
              {post.comments && post.comments.length > 0 ? (
                <div className="comments-list">
                  {post.comments.map((comment: Comment) => (
                    <article key={comment._id} className="comment">
                      <header className="comment-header">
                        <strong>{comment.author}</strong>
                        <time
                          dateTime={comment.createdAt}
                          className="comment-date"
                        >
                          {formatDate(comment.createdAt)}
                        </time>
                      </header>
                      <p className="comment-content">{comment.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="no-comments">Sé el primero en comentar</p>
              )}
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
}
