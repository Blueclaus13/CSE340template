const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
  *  Classification Validation Rules
  * ********************************* */
validate.classificationRules = () => {
    return [
body("classification_name")
      .notEmpty()
      .isAlpha()
      .isLength({ min: 1 })
      .matches(pattern = "^[A-Za-z]+$")
      .withMessage("A valid classification is required.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name)
        if (classificationExists){
          throw new Error("Classification exist. Please try to enter another classification")
        }
      }),
    ]
}

/* ******************************
 * Check data and return errors or continue to classification
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const login =  utilities.Login(res.locals.accountData)
      res.render("inventory/add-classification", {
        errors,
        login,
        title: "Add New Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
  }

module.exports = validate;