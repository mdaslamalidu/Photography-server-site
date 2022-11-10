const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// midile war
app.use(cors(""));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("photographey server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nkioy4j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function varifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("photoService").collection("services");
    const userReview = client.db("photoService").collection("review");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/serviceDetails/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      let query = {};
      if (req.query.id) {
        query = {
          id: req.query.id,
        };
      }
      const cursor = userReview.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myReview", varifyToken, async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
        const cursor = userReview.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userReview.findOne(query);
      res.send(result);
    });

    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userReview.updateOne(query, { $set: req.body });
      console.log(result);
      res.send(result);
    });

    app.delete("/myReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userReview.deleteOne(query);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const query = req.body;
      const result = await userReview.insertOne(query);
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const query = req.body;
      const result = await serviceCollection.insertOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
