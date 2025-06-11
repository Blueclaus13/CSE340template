// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const utilities = require("../utilities");

// Route to login
router.get("/login",  utilities.handleErrors(accountController.buildLogin));
// Route to logout
router.get("/logout", utilities.handleErrors(accountController.logout));
// Route to register account
router.get("/register",  utilities.handleErrors(accountController.buildRegister));
// Process the login attempt
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin))
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
// Route to account view once loggin
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagment));

// Route to account information view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.accountInfomation));

// Route to update account information 
router.post("/update/", utilities.checkLogin, regValidate.changeInformationRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccountInfomation));

// Route to update account password 
router.post("/changepassword/", utilities.checkLogin, regValidate.changePasswordRules(), regValidate.checkPassowordData , utilities.handleErrors(accountController.updateAccountPassword));

// Route to update account password 
router.post("/changepassword/", utilities.checkLogin, regValidate.changePasswordRules(), regValidate.checkPassowordData , utilities.handleErrors(accountController.updateAccountPassword));

module.exports = router;