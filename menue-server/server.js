const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Datastore = require("nedb");
var cors = require("cors");

const port = 3000;
const app = express();

const { ipcRenderer } = require("electron");

const server = require("http").Server(app);
const io = require("socket.io")(server);

server.listen(port, () => {
  console.log(
    `Le serveur est en cours d'exécution. Vous pouvez réduire cette fenêtre et lancer l'application client et manage.`
  );

  ipcRenderer.send("ready");
});

app.use(cors());
app.use(express.static("./public/uploads/"));
app.use(express.json());

let db = {};
db.dishes = new Datastore({ filename: "./db/dishes", autoload: true });
db.categories = new Datastore({ filename: "./db/categories", autoload: true });
db.orders = new Datastore({ filename: "./db/orders", autoload: true });
db.identifiers = new Datastore({
  filename: "./db/identifiers",
  autoload: true,
});

function createDefaultCategories() {
  let defaultCategories = [
    {
      title: "All",
      dynamic: false,
      sortingHelper: "0All",
    },
    {
      title: "Other",
      dynamic: false,
      sortingHelper: "1Other",
    },
  ];

  db.categories.insert(defaultCategories, (err, newDocs) => {
    if (err) console.log(err);
  });
}

db.categories.find({ dynamic: false }, (err, docs) => {
  if (docs.length === 0) createDefaultCategories();
});

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("dish");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error! Images Only");
  }
}

app.get("/", (req, res) => {
  res.send({
    title: "Dinnert",
    website: "http://www.dinnert.live/",
    description: "an application for real-time food related orders management",
    developer: "NOUARI Yazid",
  });
});

function createDish(data, image) {
  let dish = {
    name: data.name,
    price: data.price,
    image: image.filename,
    category: data.category,
    available: true,
    created: new Date(),
  };
  return dish;
}

function findDishes(res, next) {
  db.dishes
    .find({})
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) next(err);
      else res.send(docs);
    });
}

app.get("/dishes", (req, res, next) => {
  findDishes(res, next);
});

app.get("/dishes/:category", (req, res, next) => {
  db.dishes.find({ category: req.params.category }, (err, docs) => {
    if (err) next(err);
    else res.send(docs);
  });
});

app.get("/dishes-sort/:parameter", (req, res, next) => {
  if (req.params.parameter === "abc") {
    db.dishes
      .find({})
      .sort({ name: 1 })
      .exec((err, docs) => {
        if (err) next(err);
        else res.send(docs);
      });
  } else if (req.params.parameter === "123") {
    db.dishes
      .find({})
      .sort({ price: 1 })
      .exec((err, docs) => {
        if (err) next(err);
        else res.send(docs);
      });
  }
});

app.post("/dishes", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) next(err);
    else {
      db.dishes.findOne({ name: req.body.name }, (err, doc) => {
        if (err) next(err);
        else {
          if (!doc) {
            if (req.file == undefined) {
              db.dishes.insert(
                createDish(req.body, { filename: "default.jpg" }),
                (err, newDoc) => {
                  findDishes(res, next);
                }
              );
            } else {
              db.dishes.insert(
                createDish(req.body, req.file),
                (err, newDoc) => {
                  findDishes(res, next);
                }
              );
            }

            io.emit("catalog");
          } else res.status(403).send("Dish already exists.");
        }
      });
    }
  });
});

app.put("/dishes", (req, res, next) => {
  db.dishes.update(
    { name: req.body.dish },
    { $set: { category: "Other" } },
    (err, updatedDocs) => {
      if (err) next(err);
      else res.send("Done");
    }
  );
});

app.put("/dishes-av", (req, res, next) => {
  db.dishes.update(
    { name: req.body.name },
    { $set: { available: !req.body.available } },
    (err, updatedDoc) => {
      if (err) next(err);
      else {
        db.dishes
          .find({})
          .sort({ created: -1 })
          .exec((err, docs) => {
            if (err) next(err);
            else {
              res.send(docs);
              io.emit("catalog");
            }
          });
      }
    }
  );
});

app.get("/dishes-av", (req, res, next) => {
  db.dishes
    .find({ available: true })
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) next(err);
      else res.send(docs);
    });
});

app.get("/dishes-av-sort/:parameter", (req, res, next) => {
  if (req.params.parameter === "abc") {
    db.dishes
      .find({ available: true })
      .sort({ name: 1 })
      .exec((err, docs) => {
        if (err) next(err);
        else res.send(docs);
      });
  } else if (req.params.parameter === "123") {
    db.dishes
      .find({ available: true })
      .sort({ price: 1 })
      .exec((err, docs) => {
        if (err) next(err);
        else res.send(docs);
      });
  }
});

app.get("/dishes-av/:category", (req, res, next) => {
  db.dishes
    .find({ category: req.params.category, available: true })
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) next(err);
      else res.send(docs);
    });
});

app.delete("/dishes", (req, res, next) => {
  db.dishes.remove({}, { multi: true }, (err, docs) => {
    if (err) next(err);
    else {
      fs.readdir("./public/uploads/", (err, files) => {
        if (err) next(err);

        for (const file of files) {
          fs.unlink(path.join("./public/uploads/", file), (err) => {
            if (err) throw err;
          });
        }

        io.emit("catalog");
      });

      res.send("DB Cleared.");
    }
  });
});

app.delete("/dishes/:name/:image", (req, res, next) => {
  db.dishes.remove({ name: req.params.name }, {}, (err, doc) => {
    if (err) next(err);
    else {
      if (req.params.image !== "default.jpg") {
        fs.unlink(path.join("./public/uploads/", req.params.image), (err) => {
          if (err) next(err);
        });
      }

      findDishes(res, next);
    }

    io.emit("catalog");
  });
});

function createCategory(data) {
  let category = {
    title: data.title,
    dynamic: true,
    sortingHelper: data.title,
    created: new Date(),
  };
  return category;
}

function findDynamicCategories(res, next) {
  db.categories
    .find({ dynamic: true })
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) next(err);
      else res.send(docs);
    });
}

app.post("/categories", (req, res, next) => {
  db.categories.insert(createCategory(req.body), (err, newDoc) => {
    if (err) next(err);
    findDynamicCategories(res, next);
    io.emit("categories");
  });
});

app.put("/categories", (req, res, next) => {
  db.categories.update(
    { title: req.body.oldTitle },
    { $set: { title: req.body.title } },
    (err, newDoc) => {
      if (err) next(err);
      else {
        db.dishes.update(
          { category: req.body.oldTitle },
          { $set: { category: req.body.title } },
          { multi: true }
        );
        findDynamicCategories(res, next);
        io.emit("categories");
      }
    }
  );
});

app.get("/categories", (req, res, next) => {
  findDynamicCategories(res, next);
});

app.get("/categories-all", (req, res, next) => {
  db.categories
    .find({})
    .sort({ sortingHelper: 1 })
    .exec((err, docs) => {
      if (err) next(err);
      else res.send(docs);
    });
});

app.delete("/categories", (req, res, next) => {
  db.categories.remove({ dynamic: true }, { multi: true }, (err, docs) => {
    if (err) next(err);

    db.dishes.update(
      { $not: { category: "Other" } },
      { $set: { category: "Other" } },
      { multi: true },
      (err, docs) => {
        if (err) next(err);
        res.send("Cleared");
        io.emit("categories");
      }
    );
  });
});

app.delete("/categories/:title", (req, res, next) => {
  db.categories.remove({ title: req.params.title }, (err, docs) => {
    if (err) next(err);
    else {
      db.dishes.update(
        { category: req.params.title },
        { $set: { category: "Other" } },
        { multi: true },
        (err, doc) => {
          if (err) next(err);
          res.send("Cleared");
          io.emit("categories");
        }
      );
    }
  });
});

function returnValidOrders(res, next) {
  db.orders
    .find({ served: false, cancelled: false })
    .sort({ number: 1 })
    .exec((err, docs) => {
      if (err) next(err);
      else {
        db.orders.count({ awaiting: true, cancelled: false }, function (
          err,
          count
        ) {
          if (err) next(err);
          else res.send({ orders: docs, awaitingOrders: count });
        });
      }
    });
}

app.get("/orders", (req, res, next) => {
  returnValidOrders(res, next);
});

app.get("/orders/:number", (req, res, next) => {
  db.orders.findOne(
    {
      number: parseInt(req.params.number),
      awaiting: true,
      served: false,
      cancelled: false,
    },
    (err, doc) => {
      if (err) next(err);
      else res.send(doc.dishes);
    }
  );
});

app.get("/orders-count", (req, res, next) => {
  db.orders.count({ cancelled: false, served: false }, (err, count) => {
    if (err) next(err);
    else res.send(String(count));
  });
});

function createOrder(data, awaiting, identifier) {
  let order = {
    ...data,
    ...{
      awaiting: awaiting,
      served: false,
      cancelled: false,
      created: new Date(),
      number: identifier,
    },
  };
  return order;
}

function addOrderToDatabase(data, identifier, next) {
  db.orders.find(
    { awaiting: false, served: false, cancelled: false },
    (err, doc) => {
      if (err) next(err);
      else {
        if (doc.length === 0)
          db.orders.insert(createOrder(data, false, identifier));
        else db.orders.insert(createOrder(data, true, identifier));
      }
    }
  );
}

app.post("/orders", (req, res, next) => {
  db.identifiers
    .find({})
    .sort({ number: -1 })
    .limit(1)
    .exec((err, docs) => {
      if (err) next(err);
      else {
        if (docs.length === 0) {
          db.identifiers.insert({ number: 0 }, (err, doc) => {
            addOrderToDatabase(req.body, doc.number, next);
            io.emit("order");
            res.send(`${doc.number}`);
          });
        } else {
          db.identifiers.insert({ number: docs[0].number + 1 }, (err, doc) => {
            addOrderToDatabase(req.body, doc.number, next);
            io.emit("order");
            res.send(`${doc.number}`);
          });
        }
      }
    });
});

app.put("/orders", (req, res, next) => {
  if (req.body.action === "served") {
    db.orders.update(
      { awaiting: false, served: false, cancelled: false },
      { $set: { served: true } },
      (err, d) => {
        if (err) next(err);
        db.orders
          .find({ awaiting: true, cancelled: false })
          .sort({ number: 1 })
          .limit(1)
          .exec((err, ds) => {
            if (err) next(err);

            if (ds.length === 0) {
              returnValidOrders(res);
            } else {
              db.orders.update(
                { number: ds[0].number },
                { $set: { awaiting: false } },
                (err, o) => {
                  if (err) next(err);
                  returnValidOrders(res);
                }
              );
            }
          });
      }
    );
  } else {
    if (req.body.identifier) {
      db.orders.update(
        { awaiting: true, cancelled: false, number: req.body.identifier },
        { $set: { cancelled: true } },
        (err, doc) => {
          if (err) next(err);
          returnValidOrders(res);
        }
      );
    } else {
      db.orders.update(
        { awaiting: false, cancelled: false, served: false },
        { $set: { cancelled: true } },
        (err, d) => {
          if (err) next(err);
          db.orders
            .find({ awaiting: true, cancelled: false })
            .sort({ number: 1 })
            .limit(1)
            .exec((err, ds) => {
              if (err) next(err);

              if (ds.length === 0) {
                returnValidOrders(res);
              } else {
                db.orders.update(
                  { number: ds[0].number },
                  { $set: { awaiting: false } },
                  (err, o) => {
                    if (err) next(err);
                    returnValidOrders(res);
                  }
                );
              }
            });
        }
      );
    }
  }

  io.emit("served");
});

app.delete("/orders", (req, res, next) => {
  db.orders.remove({}, { multi: true }, (err, docs) => {
    if (err) next(err);
    res.send("Clear.");
  });
});

app.delete("/identifiers", (req, res, next) => {
  db.identifiers.remove({}, { multi: true }, (err, docs) => {
    if (err) next(err);
    res.send("Clear.");
  });
});

app.get("/stats", (req, res, next) => {
  db.orders.find({ served: true }, (err, orders) => {
    if (err) next(err);

    let totalCategories = [];

    orders.forEach((order) => {
      order.dishes.forEach((dish) => {
        totalCategories.push(dish.category);
      });
    });

    let counts = {};

    totalCategories.forEach((element, index) => {
      let num = totalCategories[index];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    });

    let categoriesTitles = [...new Set(totalCategories)];
    let categoriesCount = [];

    categoriesTitles.forEach((category) => {
      categoriesCount.push(counts[category]);
    });

    db.orders.count({ served: true }, (err, served) => {
      if (err) next(err);
      db.orders.count({ cancelled: true }, (err, cancelled) => {
        if (err) next(err);
        db.dishes.count({}, (err, dishes) => {
          if (err) next(err);
          db.dishes.count({ available: true }, (err, available) => {
            if (err) next(err);
            db.orders.find({ served: true }, (err, servedOrders) => {
              if (err) next(err);

              let revenue = 0;

              servedOrders.forEach((order) => {
                revenue += order.total;
              });

              db.orders.count({}, (err, total) => {
                if (err) next(err);

                res.send({
                  orders: [total, served, cancelled],
                  dishes: dishes,
                  revenue: revenue,
                  availableDishes: available,
                  categoriesTitles: categoriesTitles,
                  categoriesCount: categoriesCount,
                });
              });
            });
          });
        });
      });
    });
  });
});