const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }
  
/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* *****************************
* Return account data using account_id
* ***************************** */
async function getUsers () {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account')
    return result.rows
  } catch (error) {
    return new Error("No users in account table")
  }
}

async function updateAccontInformation(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = 
      'UPDATE public.account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING *'

    const data = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function updateUserIformation(account_id, account_firstname, account_lastname, account_email, account_type) {
  try {
    const sql = 
      'UPDATE public.account SET account_firstname = $2, account_lastname = $3, account_email = $4, account_type = $5 WHERE account_id = $1 RETURNING *'

    const data = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email, account_type])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function updateAccontPwd(account_id, account_password) {
  try {
    const sql = 
      'UPDATE public.account SET account_password = $2 WHERE account_id = $1 RETURNING *'

    const data = await pool.query(sql, [account_id, account_password])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete user
 * ************************** */
async function deleteUser(user_id) {
  try {
    const sql = 'DELETE FROM public.account WHERE account_id = $1'
    const data = await pool.query(sql, [user_id])
    return data
  } catch (error) {
    new Error("Delete User error")
  }
}
  module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccontInformation, updateAccontPwd, getUsers, deleteUser, updateUserIformation};