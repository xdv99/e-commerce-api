const router = require("express").Router();
const Auth = require("../controllers/auth");
const User = require("../controllers/user");
const { body, param } = require("express-validator");
const validate = require("../config/validate");

// Request OTP
/**
 * @swagger
 * /requestOTP:
 *   post:
 *     summary: Request OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 11
 *                 description: The phone number of the user starting with +964
 *               channel:
 *                 type: string
 *                 enum: [whatsapp, sms]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid Phone Number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: Invalid Phone Number
 */
router.post(
  "/requestOTP",
  Auth.isNotAuthenticated,
  body("phone")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isString()
    .withMessage("Phone Number must be a string")
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone Number must be a valid phone number"),
  body("channel")
    .notEmpty()
    .withMessage("Channel is required")
    .isString()
    .withMessage("Channel must be a string")
    .isIn(["sms", "whatsapp"])
    .withMessage("Channel must be 'sms' or 'whatsapp'"),
  validate,
  Auth.requestOTP
);

// Verify OTP
/**
 * @swagger
 * /verifyOTP:
 *   post:
 *     summary: Verify OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 11
 *                 description: The phone number of the user starting with +964
 *               otp:
 *                 type: number
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: The OTP sent to the user
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token of the user
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: Invalid OTP
 */
router.post(
  "/verifyOTP",
  Auth.isNotAuthenticated,
  body("phone")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isString()
    .withMessage("Phone Number must be a string")
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone Number must be a valid phone number"),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isNumeric()
    .withMessage("OTP must be a number")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be a 6-digit number"),
  validate,
  Auth.verifyOTP
);

// Get user
/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/user/:id",
  Auth.isOwnerOrManger,
  param("id")
    .isMongoId()
    .withMessage("Invalid ID")
    .notEmpty()
    .withMessage("ID is required"),
  validate,
  User.getUser
);

// Edit User
/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Edit user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 25
 *                 description: The name of the user
 *               address:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 70
 *                 description: The address of the user
 *               lng:
 *                 type: number
 *                 description: The longitude of the user
 *               lat:
 *                 type: number
 *                 description: The latitude of the user
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  "/user/:id",
  Auth.isOwner,
  param("id")
    .isMongoId()
    .withMessage("Invalid ID")
    .notEmpty()
    .withMessage("ID is required"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 25 })
    .withMessage("Name must be between 3 and 25 characters"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .isLength({ min: 8, max: 70 })
    .withMessage("Address must be between 8 and 70 characters"),
  body("lng")
    .optional()
    .isNumeric()
    .withMessage("Longitude must be a number")
    .isLength({ min: 1, max: 20 })
    .withMessage("Longitude must be between 1 and 20 characters"),
  body("lat")
    .optional()
    .isNumeric()
    .withMessage("Latitude must be a number")
    .isLength({ min: 1, max: 20 })
    .withMessage("Latitude must be between 1 and 20 characters"),
  validate,
  User.updateProfile
);

module.exports = router;
