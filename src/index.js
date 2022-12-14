const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const usernameAlreadyExists = users.find(user => user.username === username)

  if (!usernameAlreadyExists) {
    return response.status(400).json({ error: "Username not found!" })
  }
  request.username = usernameAlreadyExists
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.some((user) => user.username === username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists!" })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []

  })
  const user = users.find((user) => user.username === username)
  return response.status(201).send(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.username

  const user = users.find((user) => user.username === username)
  const todos = user.todos

  return response.send(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body
  const { id } = request.params


  const todo = username.todos.find((todo)=> todo.id === id)
  
  if(!todo){
    response.status(404).json({error: "Todo not found!"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const todo = username.todos.find(todo => todo.id === id)

  if (!todo) {
    response.status(404).json({ error: "Todo not exists!" })
  }
  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const todo = username.todos.findIndex((todo) => todo.id === id)

  if (todo === -1) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  username.todos.splice(todo, 1)

  return response.status(204).send()

});

module.exports = app;