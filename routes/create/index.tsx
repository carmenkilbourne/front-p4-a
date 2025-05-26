import { Handlers } from "$fresh/server.ts";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../utils/config.ts";
import {
  hasValidationErrors,
  isApiResponseError,
} from "../../models/api_response.ts";
import { useState } from "preact/hooks/src/index.d.ts";

interface FormDataError {
  title?: string;
  content?: string;
  author?: string;
  cover?: string;
}

function isValidFormDataKey(key: string): key is keyof FormDataError {
  return ["title", "content", "author", "cover"].includes(key);
}

export const handler: Handlers = {

  async POST(req:Request, ctx) {

    const form = await req.formData();
    const title = form.get("title")?.toString();
    const content = form.get("content")?.toString();
    const author = form.get("author")?.toString();
    const cover = form.get("cover")?.toString();

    try {
      const response=await axios.post<FormDataError>(`${API_BASE_URL}/api/posts`,
        {
        title:title,
        content:content,
        author:author,
        cover:cover
      }
    );
      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, {
        headers,
        status: 303,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const body = await axiosError.response?.data;

      if (isApiResponseError(body)) {
        const errors: FormDataError = {};
        if (hasValidationErrors(body.error)) {
          body.error.details.forEach((detail) => {
            if (isValidFormDataKey(detail.path)) {
              errors[detail.path] = detail.message;
            }
          });
          return ctx.render({ errors });
        }
      }

      return ctx.render({
        errors: {
          title: "Ha habido un error al crear el post",
          content: "Ha habido un error al crear el post",
          author: "Ha habido un error al crear el post",
          cover: "Ha habido un error al crear el post",
        },
      });
    }
  },
  GET(_req, ctx) {
    return ctx.render({
      errors: { title: "", content: "", author: "", cover: "" },
    });
  },
};

interface PageProps {
  data: {
    errors?: FormDataError;
  };
}

export default function Create({ data }: PageProps) {
  const { errors = {} } = data || {};
  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Crear Nuevo Post</h1>

      <form className="post-form" action="/create" method="POST">
        <div className="form-group">
          <label htmlFor="title" name="title" className="form-label">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={errors?.title ? "form-input input-error" : "form-input"}
            placeholder="Escribe un título atractivo"
            required
          />
          {errors?.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="content" name="content" className="form-label">
            Contenido
          </label>
          <textarea
            id="content"
            name="content"
            className={errors?.content
              ? "form-textarea input-error"
              : "form-textarea"}
            rows={8}
            placeholder="Escribe el contenido de tu post aquí..."
            required
          >
          </textarea>
          {errors?.content && <p className="error-message">{errors.content}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="author" name="author" className="form-label">
            Autor
          </label>
          <input
            type="text"
            id="author"
            name="author"
            className={errors?.author ? "form-input input-error" : "form-input"}
            required
          />
          {errors?.author && <p className="error-message">{errors.author}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="cover" name="cover" className="form-label">
            URL de la imagen de portada
          </label>
          <input
            type="url"
            id="cover"
            name="cover"
            className={errors?.cover ? "form-input input-error" : "form-input"}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {errors?.cover && <p className="error-message">{errors.cover}</p>}
        </div>

        <div className="form-actions">
          <a href="/">
          <button type="submit" className="submit-button">
            Publicar Post
          </button>
          </a>
          <a href="/">
          <button type="button" className="cancel-button">
            Cancelar
          </button>
          </a>
          
        </div>
      </form>
    </div>
  );
}
