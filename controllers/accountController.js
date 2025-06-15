const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
	const login =  utilities.Login(res.locals.accountData)
    res.render("account/login", {
        title: "Login",
        nav,
		login,
        errors: null
    })
    }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  const login =  utilities.Login(res.locals.accountData)
  res.render("account/register", {
    title: "Register",
    nav,
	login,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
	let nav = await utilities.getNav()
	const login =  utilities.Login(res.locals.accountData)
	const { account_firstname, account_lastname, account_email, account_password } = req.body

	// Hash the password before storing
	let hashedPassword
	try {
		// regular password and cost (salt is generated automatically)
		hashedPassword = await bcrypt.hashSync(account_password, 10)
	} catch (error) {
		req.flash("notice", 'Sorry, there was an error processing the registration.')
		res.status(500).render("account/register", {
		title: "Registration",
		nav,
		login,
		errors: null,
		})
	}

	const regResult = await accountModel.registerAccount(
		account_firstname,
		account_lastname,
		account_email,
		hashedPassword
	);

	if (regResult) {
		req.flash(
		"notice",
		`Congratulations, you\'re registered ${account_firstname}. Please log in.`
		)
		res.status(201).render("account/login", {
		title: "Login",
		nav,
		login,
		errors: null
		})
	} else {
		req.flash("notice", "Sorry, the registration failed.")
		res.status(501).render("account/register", {
		title: "Registration",
		nav,
		login,
		errors: null,
		})
	}
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
	let nav = await utilities.getNav()
	const { account_email, account_password } = req.body
	const accountData = await accountModel.getAccountByEmail(account_email)
	const login =  utilities.Login(accountData)
	if (!accountData) {
		req.flash("notice", "Please check your credentials and try again.")
		res.status(400).render("account/login", {
		title: "Login",
		nav,
		login,
		errors: null,
		account_email
	})
	return
	}
	try {
		const match = await bcrypt.compare(account_password, accountData.account_password)
	 if (match) {
		delete accountData.account_password
		const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
		if(process.env.NODE_ENV === 'development') {
			res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
			console.log("jwt sent")
		} else {
			res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
		}
	 	return res.redirect("/account/")
	}else{
		req.flash("notice", "Incorrect password, please try again")
		res.status(401).render("account/login", {
		title: "Login",
		nav,
		login,
		errors: null,
		account_email
		})
	}
	//console.log("Do they match?", match)
	} catch (error) {
		return new Error('Access Forbidden')
	}
}

async function accountManagment(req, res, next) {
	let nav = await utilities.getNav()
	const login =  utilities.Login(res.locals.accountData)
	const invManagement = utilities.inventoryManagement(res.locals.accountData)
	const userManagement = utilities.userManagement(res.locals.accountData)
	const accountId = utilities.getUserId(res.locals.accountData)
	const name = res.locals.accountData.account_firstname
	res.render("account/account-management", {
		title: "Account Management",
		nav,
		login, 
		name,
		invManagement,
		userManagement,
		accountId,
		errors: null,
    })
}

/* ***************************
 *  Build Users management view
 * ************************** */
async function buildUserManagement(req, res, next) {
  let nav = await utilities.getNav()
  const login =  utilities.Login(res.locals.accountData)
  const usersList = await utilities.buildUsersList(res.locals.accountData.account_id)
  res.render("account/user-management", {
    title: "Users Management",
    nav,
	login,
    errors: null,
    users: usersList
  })
}

/* ****************************************
*  Logout account
* *************************************** */
async function logout(req, res) {
	let nav = await utilities.getNav()
	let logOut = res.clearCookie('jwt')
	if (logOut) {
		// req.flash("notice",`User logout successfully`)
		console.log(`User logout successfully`)
		res.status(201).redirect("/")
	} 
}

/* ****************************************
*  Manager Update-Account information view
* *************************************** */
async function userInformation(req, res) {
	let nav = await utilities.getNav()
	const getUserAccountById = await accountModel.getAccountById(req.params.account_id)
	const login =  utilities.Login(res.locals.accountData)
	const { account_id, account_firstname, account_lastname, account_email, account_type} = getUserAccountById
	//console.log("Account type" + account_type)
	if (getUserAccountById) {
		res.render("account/manager-update-account", {
			title: "Edit Account",
			nav,
			errors: null,
			login,
			account_id, 
			account_firstname, 
			account_lastname, 
			account_email,
			account_type
		})
	} 
}

/* **********************************
* Build delete view
************************************ */
async function deleteView(req, res) {
	const userId = parseInt(req.params.user_id)
	let nav = await utilities.getNav()
	const login =  utilities.Login(res.locals.accountData)
	const getUserAccountById = await accountModel.getAccountById(userId)
	const { account_firstname, account_lastname, account_email, account_type, account_id} = getUserAccountById
	const titleName = `${account_firstname} ${account_email}`
	res.render("account/delete-confirmation", {
		title: "Delete " + titleName,
		nav,
		login,
		errors: null,
		account_firstname, 
		account_lastname, 
		account_email,
		account_type,
		account_id
	})
}

/* ****************************************
*  Delete User
* *************************************** */
async function deleteUser(req, res) {
	const {account_firstname, account_email, account_id } = req.body
	const userId = parseInt(account_id)
	
	const titleName = `${account_firstname} ${account_email}`
	const deleteResult = await accountModel.deleteUser(userId)

	if (deleteResult) {
		req.flash(
			"notice",
			`The ${titleName} was successfully deleted.`
		)
		res.redirect("/account/inv")
	} else {
		req.flash("notice", "Sorry, the deletion failed.")
		res.redirect(`/account/delete/${userId}`)
	}
}

/* ****************************************
*  Update-Account information view
* *************************************** */
async function accountInfomation(req, res) {
	let nav = await utilities.getNav()
	const getAccountById = await accountModel.getAccountById(res.locals.accountData.account_id)
	const login =  utilities.Login(getAccountById)
	const { account_id, account_firstname, account_lastname, account_email} = getAccountById
	
	if (getAccountById) {
		res.render("account/update-account", {
			title: "Edit Account",
			nav,
			errors: null,
			login,
			account_id, 
			account_firstname, 
			account_lastname, 
			account_email,
		})
	} 
}
/* ****************************************
*  Update account information
* *************************************** */
async function updateAccountInfomation(req, res) {
	let nav = await utilities.getNav()
	const { account_id, account_firstname, account_lastname, account_email} = req.body
	const updateResult = await accountModel.updateAccontInformation(
		account_id, account_firstname, account_lastname, account_email)
	const login =  utilities.Login(req.body)

	if (updateResult) {
		req.flash(
		"notice",
		`Congratulations, your information has been updated.`
		)
		res.status(201).redirect("/account/")
	} else {
		res.status(501).render("./account/update-account", {
			title: "Edit Account",
			nav,
			errors: null,
			login,
			account_id, 
			account_firstname, 
			account_lastname, 
			account_email,
		})
	}
}

/* ****************************************Add commentMore actions
*  Update account password
* *************************************** */
async function updateAccountPassword(req, res) {
	let nav = await utilities.getNav()
	const getAccountById = await accountModel.getAccountById(res.locals.accountData.account_id)
	const login =  utilities.Login(getAccountById)
	const { account_password } = req.body
	const {account_id} = getAccountById
	//const { account_id, account_password,} = getAccountById

	let hashedPassword = await bcrypt.hashSync(account_password, 10)
	const updateResult = await accountModel.updateAccontPwd(account_id, hashedPassword)

	if (updateResult) {
		req.flash(
		"notice",
		`Congratulations, your password has been updated.`
		)
		res.status(201).redirect("/account/")
	} else {
		res.status(501).render("./account/update-account", {
			title: "Edit Account",
			nav,
			errors: null,
			login,
			account_id, 
			account_firstname, 
			account_lastname, 
			account_email,
		})
	}
}

module.exports = { buildLogin, buildRegister, registerAccount, accountManagment, accountLogin, logout, accountInfomation, updateAccountInfomation, updateAccountPassword, buildUserManagement, userInformation, deleteView, deleteUser }