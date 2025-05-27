const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
};

/* ***************************
 *  Build details of car view
 * ************************** */
invCont.buildDetailsId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getCarDetails(classification_id)
  const grid = await utilities.buildDetailsById(data)
  let nav = await utilities.getNav()
  const className = data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model
  res.render("./inventory/classification", {
    title: className,
    nav,
    grid,
  })
}

/* ***************************
 *  Build error view
 * ************************** */
invCont.buildError = async function (req, res, next) {
  const data = await invModel.error() 
  const message = await utilities.buildErrorMessage(data)
  let nav = await utilities.getNav()
  res.render("./errors/error", {
    title: data,
    nav,
    message,
  })
}


module.exports = invCont;