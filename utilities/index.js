const { body } = require("express-validator")
const invModel = require("../models/inventory-model")
const accountM = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
//   console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildDetailsById = async function(data){
  let grid
  if(data.inv_id > 0){
    grid = '<section id="details-display">'
      grid += '<a  href="#" title="Image of ' + data.inv_make + ' ' + data.inv_model +'">'
      grid +=  '<img src="' + data.inv_image +'" alt="Image of '+ data.inv_make + ' ' + data.inv_model +' "> </a>'
      grid += ' <div class="description">'
      grid += '<h2> '
      grid += data.inv_make + ' ' + data.inv_model + ' Details '
      grid += '</h2>'
      grid += '<p class="bg-color" > <span class="bold">Price: </span>' + ' $'
      + new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>' 
      grid += '<p> <span class="bold">Description: </span>' + data.inv_description + ' </p>'
      grid += ' <p class="bg-color" > <span class="bold">Color: </span>' + data.inv_color + ' </p>'
      grid += ' <p> <span class="bold">Miles: </span>' + new Intl.NumberFormat('en-US').format(data.inv_miles) +' </p>'
      grid += '</div>'
    
    grid += '</section>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build error view HTML
* ************************************ */
Util.buildErrorMessage = async function(){
  let error500
    error500 = '<div id="details-display-error">'
    error500 += '<div class="error-img"><img src="/images/error/error.jpg" alt="Image for error"/></div>'
    error500 += '<p>Oh no! There was an Error. Please try a different route</p>'
    error500 += '</div>'
  return error500
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ************************
 * Build the classification list
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

Util.buildUsersList = async function (current_id) {
  let data = await accountM.getUsers()
  // console.table(data)
  let usersList = data.filter( user => user.account_id !== current_id)
  .map(row =>({
    id: row.account_id,
    firstName: row.account_firstname,
    lastName: row.account_lastname,
    email: row.account_email,
    accountType: row.account_type
  }))
  return usersList;
}

  /* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ************************
 * Constructs the login section 
 ************************** */
Util.Login = function (accountData=null) {
    let login = '<div id="tools">'
    if (accountData == null) {
        login += '<a href="\/account\/login" title="Click to login">My Account</a>'
        console.log("NO logged in");
    } else {
        console.log("logged in" + accountData.account_firstname)
        login += `<a href="/account" title="Welcome">Welcome ${accountData.account_firstname} </a>`
        login += '<a href="/account/logout" title="Logout"> Logout</a>'
    }
    login += "</div>"
    return login
}

/* ************************
 * Constructs the Invenotry management section 
 ************************** */
Util.inventoryManagement = function (accountData=null) {
    let invManagement = ""
    if (accountData.account_type == "Admin" || accountData.account_type == "Employee" ) {
        invManagement += '<h3 class ="sub-title" >Inventory Management</h3>'
        invManagement += '<div class="button-container"><a class ="link" href="/inv" title="Manage inventory">Manage Inventory</a></div>'
    }
    return invManagement
}

/* ************************
 * Constructs the User management section 
 ************************** */
Util.userManagement = function (accountData=null) {
    let userManagement = ""
    if (accountData.account_type == "Admin") {
        userManagement += '<h3 class ="sub-title" >User Management</h3>'
        userManagement += '<div class="button-container"><a class ="link" href="/account/inv" title="Manage users inventory">Manage Users Inventory</a></div>'
    }
    return userManagement
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
  }
}

 /* ****************************************
 *  Get user ID
 * ************************************ */
 Util.getUserId = (accountData) => {
  if (accountData) {
    return accountData.account_id
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


 /* ****************************************
* Middleware give AuthZ to inventory
**************************************** */
Util.checkAcountType = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
    	res.locals.accountData = accountData
		if (accountData.account_type == "Admin" || accountData.account_type == "Employee" ) {
			// if (accountData.account_type == "Admin"){
			// 	res.locals.authZ = 1
			// }
			next()
		} else {
        	return res.redirect("/account/login")
    	}
	})
  } 
}



module.exports = Util;