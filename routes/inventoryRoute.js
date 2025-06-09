// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classValidate = require('../utilities/classification-validation')
const vehicleValidate = require('../utilities/vehicle-validation')
const utilities = require("../utilities");

//Route to building management viewAdd commentMore actions
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
//Route to get details of car by ID
router.get("/detail/:classificationId", utilities.handleErrors(invController.buildDetailsId));
// Route to build error 500
router.get("/error/:classificationId", utilities.handleErrors(invController.buildError));

// Route to build add-classification
router.get("/add_classification", utilities.handleErrors(invController.addClassification));
// Route to build add-classification rules
router.post("/add_classification", classValidate.classificationRules(), classValidate.checkClassData , utilities.handleErrors(invController.addNewClassification));

// Route to build add-vehicle
router.get("/add_vehicle", utilities.handleErrors(invController.addInventory));

// Route to build add-vehicle
router.post("/add_vehicle", vehicleValidate.vehicleRules(), vehicleValidate.checkVehicleData, utilities.handleErrors(invController.addNewVehicle));
module.exports = router;

// Route to JSON (injet table to innerHTML)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to delete (vehicle) information
router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteView))

//Route post delete Item
router.post("/delete/", utilities.handleErrors(invController.deleteItem))