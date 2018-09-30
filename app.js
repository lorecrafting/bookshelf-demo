
const express = require('express');
const bodyParser = require('body-parser');

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const passport = require('passport')

const PORT = process.env.EXPRESS_CONTAINER_PORT;
const Tasks = require('./db/models/Tasks.js');
const Users = require('./db/models/Users.js');
const AuthRoutes = require('./routes/authRoutes.js')




const app = express();


app.use(session({
  store: new RedisStore({url: 'redis://redis-session-store:6379', logErrors: true}),
  secret: 'lollerkates',
  resave: false,
  saveUninitialized: true
}))
 
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/auth', AuthRoutes)

app.get('/', (req, res) => {
  
  if (!req.session.viewCount) {
    req.session.viewCount = 1
  } else {
    req.session.viewCount++
  }
  console.log('req.session', req.session)
  res.send('sanity check')
})

// get all users
app.get('/api/users', (req, res) => {
  Users
  .fetchAll()
  .then( users => {
    res.json(users.serialize());
  })
  .catch( err => {
    res.json(err);
  })
})

// get all tasks by user_id
app.get('/api/users/:user_id/tasks', (req, res) => {
  const { user_id } = req.params;
  Tasks
    .where({user_id})
    .fetchAll()
    .then( tasks => {
      res.json(tasks.serialize())
    })
    .catch( err => {
      res.json(err);
    })
})

// create task by user id
app.post('/api/users/:user_id/tasks/new', (req, res) => {
  const { user_id } = req.params;
  const payload = {
    name: req.body.name
  }
  Tasks
    .forge(payload)
    .save()
    .then( result => {
      res.json(result)
    })
    .catch( err => {
      console.log('error', err)
      res.json(err);
    })
})

// update task by task id
app.put('/api/tasks/:task_id/edit', (req, res) => {
  const { task_id } = req.params;
  
  const payload = {
    name: req.body.name,
    is_complete: req.body.is_complete
  }

  Tasks
    .where({task_id})
    .fetch()
    .then( task => {
      return task.save(payload)
    })
    .then( result => {
      console.log('result', result)
      res.json(result);
    })
    .catch(err => {
      res.json(err);
    })
})

// delete task by task id
app.delete('/api/tasks/:task_id/delete', (req, res) => {
  const { task_id } = req.params;
  
  Tasks
    .where({ task_id })
    .destroy()
    .then( result => {
      res.json(result);
    })
    .catch(err => {
      res.json(err);
    })
})



app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
})