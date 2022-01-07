const { request } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

morgan.token('sentdata', (request, response) => {
  requestBody = JSON.stringify(request.body)
  return requestBody
})

app.use(morgan('tiny', {
  skip: (request) => request.method === 'POST'
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :sentdata', {
  skip: (request) => request.method !== 'POST'
}))

let persons = [
  { 
    "name": "Arto Hellas", 
    "id": 1,
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const createId = () => {
  const newId = Math.floor(Math.random() * 10000)
  return newId
}

const nameExistsInPhonebook = (name) => {
  const nameExists = persons.some(person => person.name === name)  
  return nameExists
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'name and number are missing'
    })
  } else if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  if (nameExistsInPhonebook(body.name)) {
    return response.status(403).json({
      error: 'name already exists in the phonebook'
    })
  }

  const newPerson = {...body, "id": createId()}
  persons = persons.concat(newPerson)
  response.json(newPerson)
})

app.get('/info', (request, response) => {
  const nOfPersons = persons.length
  const date = new Date()
  const dateAsAString = date.toString()

  response.send(
    `<p>Phonebook has info for ${nOfPersons} people</p>
     <p>${dateAsAString}</p>
    `
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)  
  
  if (person) {
    return response.json(person)
  } else {
    response.status(404).end()
  }  
})

app.get('/', (request, response) => {
  response.send('Phonebook app backend for Full Stack Open Course')
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)  
})