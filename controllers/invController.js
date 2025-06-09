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

/* ***************************Add commentMore actions
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Veicle Management",
    nav,
    errors: null,
    classificationSelect: classificationList
  })
}

invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process New classification
* *************************************** */
invCont.addNewClassification = async function (req, res) {
	let nav = await utilities.getNav()
	const { classification_name } = req.body

	const classResult = await invModel.addClassification(
		classification_name
  )

	if (classResult) {
		req.flash(
		"notice",
		`The ${classification_name} classification was successfully added.`
		)
		res.status(201).render("./inventory/management", {
		title: "Veicle Management",
		nav,
		errors: null
		})
	} else {
		req.flash("notice", "Sorry, new classification failed.")
		res.status(501).render("./inventory/add-classification", {
		title: "Add New Classification",
		nav,
		errors: null,
		})
	}
}

invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null
  })
}

/* ****************************************
*  Add new vehicle
* *************************************** */
invCont.addNewVehicle = async function (req, res) {
	let nav = await utilities.getNav()
	const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  const classificationList = await utilities.buildClassificationList()

	const classResult = await invModel.addVehicle(
		classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )

	if (classResult) {
		req.flash(
		"notice",
		`The ${inv_make} ${inv_model} was successfully added.`
		)
		res.status(201).render("./inventory/management", {
		title: "Veicle Management",
		nav,
		errors: null,
    classificationSelect: classificationList
		})
	} else {
		req.flash("notice", "Sorry, new vehicle wasn\'t added.")
		res.status(501).render("./inventory/add-inventory", {
		title: "Add New Vehicle",
		nav,
    classificationSelect: classificationList,
		errors: null,
		})
	}
}

/* **********************************
* Return Inventory by Classification As JSON
************************************ */
invCont.getInventoryJSON = async (req, res, next) => {
	const classification_id = parseInt(req.params.classification_id)
	const invData = await invModel.getInventoryByClassificationId(classification_id)
	if (invData[0].inv_id) {
	return res.json(invData)
	} else {
     return res.status(404).json({ message: "No data returned" })
	}
}

/* **********************************
* Build delete view
************************************ */
invCont.deleteView = async function (req, res, next) {
	const invId = parseInt(req.params.inv_id)
	let nav = await utilities.getNav()
	const login =  utilities.Login(res.locals.accountData)
	const invItem = await invModel.getCarDetails(invId)
	const titleName = `${invItem.inv_make} ${invItem.inv_model}`
	res.render("./inventory/delete-confirmation", {
		title: "Delete " + titleName,
		nav,
		login,
		errors: null,
		inv_id: invItem.inv_id,
		inv_make: invItem.inv_make,
		inv_model: invItem.inv_model,
		inv_year: invItem.inv_year,
		inv_price: invItem.inv_price,
	})
}

/* ****************************************
*  Delete inventory vehicle
* *************************************** */
invCont.deleteItem = async function (req, res) {
	const {inv_make, inv_model, inv_id } = req.body
	const invId = parseInt(inv_id)

	let nav = await utilities.getNav()	
	const deleteResult = await invModel.deleteVehicle(invId)

	const itemNAme = inv_make + " " + inv_model
	if (deleteResult) {
		req.flash(
			"notice",
			`The ${itemNAme} was successfully deleted.`
		)
		res.redirect("/inv/")
	} else {
		req.flash("notice", "Sorry, the deletion failed.")
		res.redirect("./inv/delete/inv_id")
	}
}

module.exports = invCont;