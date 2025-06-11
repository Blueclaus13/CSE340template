const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const login =  utilities.Login(res.locals.accountData)
  //req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav, login})
}

module.exports = baseController