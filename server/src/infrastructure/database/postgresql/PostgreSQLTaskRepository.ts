import { Task, TaskProps } from "../../../domain/entities/task";
import { TaskRepository } from "../../persistence/TaskRepository";
import { PostgreSQLClient } from "./PostgreSQLClient";


export class PostgreSQLTaskRepository implements TaskRepository {
  private client: PostgreSQLClient

  constructor() {
    this.client = PostgreSQLClient.getInstance()
  }

  async getAll(): Promise<Task[]> {
    const result = await this.client.query('SELECT * FROM tasks')
    return result.rows.map((task: any) => new Task(task))
  }

  async create(taskProps: TaskProps): Promise<Task> {
    const task = new Task(taskProps)

    const result = await this.client.query(
      'INSERT INTO tasks (id, title, description, location, price, dueDate, media, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        task.id,
        task.title,
        task.description,
        task.location,
        task.price,
        task.dueDate,
        JSON.stringify(task.media),
        JSON.stringify(task.tags)
      ]
    );
    console.log('Query result:', result)  

    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error('Failed to create task, no data returned')
    }


    return new Task(result.rows[0])
  }
}
