require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

const Person = require('./models/person')

app.use(express.static('build'))
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

let persons = []

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

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(result => {
    response.json(newPerson)
  })
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
  Person.find({}).then(persons => {
    response.json(persons)
  })
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)  
})