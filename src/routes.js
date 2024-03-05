import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;
      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "title cannot be null" }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "description cannot be null" }));
      }
      const task = {
        id: randomUUID(),
        title,
        description,
        completedAt: "",
        createdAt: new Date().toISOString(),
        updatedAt: "",
      };
      database.insert("tasks", task);
      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title && !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title or description cannot be null" })
          );
      }

      const existingTask = database.getById("tasks", id);
      const updatedTask = {
        ...existingTask,
        title: title || existingTask.title,
        description: description || existingTask.description,
        updatedAt: new Date().toISOString(),
      };
      database.update("tasks", id, updatedTask);
      return res.writeHead(204).end();
    },
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const existingTask = database.getById("tasks", id);
      const updatedTask = {
        ...existingTask,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      database.update("tasks", id, updatedTask);
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      database.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
];
