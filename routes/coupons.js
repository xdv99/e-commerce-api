const router = require("express").Router();
const Auth = require("../controllers/auth");
const Coupon = require("../controllers/coupon");
const Cart = require("../controllers/cart");
const { body, param } = require("express-validator");
const validate = require("../config/validate");

// Get Coupons
/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", Auth.isManager, Coupon.get);

// Add coupon
/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: The created coupon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/",
  Auth.isManager,
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string")
    .toUpperCase(),
  body("value")
    .notEmpty()
    .withMessage("Discount is required")
    .isNumeric({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("limit")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Limit must be a number"),
  body("expire").optional().isISO8601().withMessage("Invalid date"),
  body("isActive").optional().isBoolean().withMessage("Invalid status"),
  validate,
  Coupon.create
);

// Update coupon
/**
 * @swagger
 * /coupons/{id}:
 *   patch:
 *     summary: Update a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the coupon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: The updated coupon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
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
  "/:id",
  Auth.isManager,
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  body("code")
    .optional()
    .isString()
    .withMessage("Code must be a string")
    .toUpperCase(),
  body("value")
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("limit")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Limit must be a number"),
  body("expire").optional().isISO8601().withMessage("Invalid date"),
  body("isActive").optional().isBoolean().withMessage("Invalid status"),
  validate,
  Coupon.update
);

// Delete coupon
/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the coupon
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   default: Coupon deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/:id",
  Auth.isManager,
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  validate,
  Coupon.delete
);

// Apply coupon
/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply a coupon
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               code:
 *                 type: string
 *                 description: The code of the coupon
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/apply",
  Auth.isAuthenticated,
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string")
    .toUpperCase(),
  validate,
  Cart.checkCoupon,
  Coupon.apply,
  Cart.applyCoupon
);

module.exports = router;
