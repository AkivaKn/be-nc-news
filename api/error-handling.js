exports.customErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.psqlErrors = (err, req, res, next) => {
  if (err.constraint) {
    const column = err.constraint.split('_')[1];
    const capitalisedColumn = column.charAt(0).toUpperCase() + column.slice(1).toLowerCase();
    res.status(404).send({msg:`${capitalisedColumn} not found`})
  } else if (err.code === "22P02" || err.code === '23502' || err.code === '23503') {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.serverError = (err, req, res, next) => {
  console.log(err)
  res.status(500).send({ msg: "Internal server error" });
};

exports.methodNotAllowed = (req, res, next) => {
  next({status:405,msg:'Method not allowed'})
}