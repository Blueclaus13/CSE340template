const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
    throw error; 
  }
};

async function getCarDetails(inv_make) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.inv_id = $1`,
      [inv_make]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getCarDetails error " + error)
  }
}
async function error() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.type = 8`
    )
    return data.rows[0]
  } catch (error) {
    console.error("getError error " + error)
    return "Server Error"
  }
}

async function addClassification(classification_name) {
  try {
    const data = await pool.query(

      `INSERT INTO public.classification (classification_name) VALUES ($1)`,
      [classification_name]
    )
    return "Adding classification was succesful"
  } catch (error) {
    console.error("Addingclassification error " + error)
  }
}

async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

async function addVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const data = await pool.query(

      `INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]
    )
    return "Adding classification was succesful"
  } catch (error) {
    console.error("Addingclassification error " + error)
  }
}

/* ***************************
 *  Update inventory Data
 * ************************** */
async function deleteVehicle(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error("Delete Inventory error")
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getCarDetails, error, addClassification, checkExistingClassification, addVehicle, deleteVehicle};