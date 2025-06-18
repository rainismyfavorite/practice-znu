"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, CheckCircle2 } from "lucide-react"

interface Todo {
  id: number
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Завантажити завдання при завантаженні компонента
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setAdding(true)
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTodo }),
      })

      if (response.ok) {
        const todo = await response.json()
        setTodos([todo, ...todos])
        setNewTodo("")
      }
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setAdding(false)
    }
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, completed: !completed }),
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
      }
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id))
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8" />
              ToDo List
            </CardTitle>
            <div className="text-center text-red-100">
              {completedCount} з {totalCount} завдань виконано
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Форма додавання нового завдання */}
            <form onSubmit={addTodo} className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Додати нове завдання..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1 border-red-200 focus:border-red-400 focus:ring-red-400"
                />
                <Button
                  type="submit"
                  disabled={adding || !newTodo.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {/* Список завдань */}
            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-red-300" />
                  <p>Немає завдань. Додайте перше завдання!</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      todo.completed
                        ? "bg-red-50 border-red-200 opacity-75"
                        : "bg-white border-gray-200 hover:border-red-300 hover:shadow-md"
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                      className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />

                    <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                      {todo.title}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Статистика */}
            {todos.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between text-sm text-red-700">
                  <span>Всього завдань: {totalCount}</span>
                  <span>Виконано: {completedCount}</span>
                  <span>Залишилось: {totalCount - completedCount}</span>
                </div>
                <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
