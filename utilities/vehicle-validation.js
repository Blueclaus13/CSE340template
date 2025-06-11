const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
  *  Vehicle Validation Rules
  * ********************************* */
validate.vehicleRules = () => {
    return [
    body("classification_id")
        .notEmpty()
        .withMessage("A valid Classification is required"),

    body("inv_make")
        .trim()
        .notEmpty()
        .isLength({ min: 3 })
        .matches(pattern= "^[A-Za-z]{2,15}$")
        .withMessage("A make is required."),

    body("inv_model")
        .trim()
        .notEmpty()
        .isLength({ min: 3 })
        .matches(pattern= "^[A-Za-z]{2,15}$")
        .withMessage("A model is required."),
    body("inv_description")
        .notEmpty()
        .matches(pattern= "^[A-Za-z][A-Za-z0-9]{1,499}$")
        .withMessage("A description must start with a letter and contain only letters and numbers, with 2 to 500 characters total."),
    body("inv_price")
        .notEmpty()
        .matches(pattern= "^[^,a-zA-Z]+[0-9\.0-9]{1,7}$")
        .withMessage("A price is required."),
    body("inv_year")
        .notEmpty()
        .isLength({min:4, max:4})
        .isNumeric()
        .matches(pattern= "^[0-9]{4}$")
        .withMessage("A year is required."),
    body("inv_miles")
        .notEmpty()
        .isLength({min:1, max:6})
        .isNumeric()
        .matches(pattern= "[0-9]{1,6}$")
        .withMessage("The miles in the car is required."),
    body("inv_color")
        .notEmpty()
        .isLength({min:1})
        .matches(pattern= "^[A-Z][a-z]{1,}$")
        .withMessage("The color of the car is required."),
    ]
}
/* ******************************
 * Check data and return errors or continue to add_vehicle
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
    let nav = await utilities.getNav()
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = []
    const classificationList = await utilities.buildClassificationList(classification_id)
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const login =  utilities.Login(res.locals.accountData)
        res.render("inventory/add-inventory", {
        errors,
        title: "Add New Vehicle",
        nav,
        login,
        classificationList,
        inv_make, 
        inv_model, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_year, 
        inv_miles, 
        inv_color,
        })
        return
    }
    next()
}

module.exports = validate;