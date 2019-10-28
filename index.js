const express = require('express')
const app = express()

app.get('/api/v1/getAllProducts', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.status(200).json([
    {   id: 1,
        title: "sneakers",
        description: "blue, comfortable"
      },
    {   id: 2,
        title: "t-shirt",
        description: "white, nike"
      },
      {   id: 3,
          title: "trousers",
          description: "jeans, pockets"
        }
    ])
})

app.listen(3000, () => console.log('Server running on port 3000'))
