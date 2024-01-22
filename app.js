var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var routesPath = path.join(__dirname, "routes");
require("fs").readdirSync(routesPath).forEach(file => {
  const name = "/" + file.replace(".js", "");
  const route = require(path.join(routesPath, file));
  app.use(name, route);
});

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Food Managment System API",
      version: "0.9.0",
    },
  },
  apis: ["./routes/*.js"],
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const specs = swaggerJsdoc(options);
app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
