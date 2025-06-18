import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET - отримати всі завдання
export async function GET() {
  try {
    const todos = await sql`
      SELECT * FROM todos 
      ORDER BY created_at DESC
    `

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
  }
}

// POST - створити нове завдання
export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const newTodo = await sql`
      INSERT INTO todos (title, completed)
      VALUES (${title.trim()}, false)
      RETURNING *
    `

    return NextResponse.json(newTodo[0], { status: 201 })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
  }
}

// PUT - оновити завдання
export async function PUT(request: NextRequest) {
  try {
    const { id, title, completed } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const updatedTodo = await sql`
      UPDATE todos 
      SET 
        title = COALESCE(${title}, title),
        completed = COALESCE(${completed}, completed),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (updatedTodo.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTodo[0])
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 })
  }
}

// DELETE - видалити завдання
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const deletedTodo = await sql`
      DELETE FROM todos 
      WHERE id = ${id}
      RETURNING *
    `

    if (deletedTodo.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
  }
}
