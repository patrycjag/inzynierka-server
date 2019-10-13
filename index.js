const express = require('express')
const app = express()

app.use(express.static('public'))

app.get('/api/v1/getAllProducts', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully',
    products: {
                id: 1,
                title: "lunch",
                description: "Go for lunc by 2pm"
              }
  })
})

app.listen(3000, () => console.log('Server running on port 3000'))
